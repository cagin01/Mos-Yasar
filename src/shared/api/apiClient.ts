export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly code: number | string,
    message: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  // Prevents HTTP Keep-Alive connection reuse, which can cause HTTP desync
  // issues when the server responds with Transfer-Encoding: chunked + gzip.
  Connection: 'close',
};

function looksLikeRawHttpMessage(value: string) {
  const trimmedValue = value.trimStart();

  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\/\d\.\d/i.test(trimmedValue)) {
    return true;
  }

  return /(?:^|\r?\n)(Host|User-Agent|Accept|Content-Length|Transfer-Encoding|Connection):\s/im.test(
    value,
  );
}

function containsNestedRawHttpPayload(value: unknown): boolean {
  if (typeof value === 'string') {
    return looksLikeRawHttpMessage(value);
  }

  if (Array.isArray(value)) {
    return value.some(containsNestedRawHttpPayload);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(containsNestedRawHttpPayload);
  }

  return false;
}

function buildRequestBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (containsNestedRawHttpPayload(body)) {
    throw new Error('Request body contains a nested raw HTTP message. Payload was blocked.');
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

interface KeycloakErrorBody {
  error: string;
  error_description?: string;
}

interface SpringBootErrorBody {
  timestamp: string;
  status: number;
  error: string;
  path: string;
}

function isKeycloakError(body: unknown): body is KeycloakErrorBody {
  return Boolean(
    body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof (body as Record<string, unknown>).error === 'string' &&
      !('status' in body),
  );
}

function isSpringBootError(body: unknown): body is SpringBootErrorBody {
  return Boolean(
    body &&
      typeof body === 'object' &&
      'status' in body &&
      'error' in body &&
      'path' in body,
  );
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return new ApiError(response.status, `HTTP ${response.status}`);
  }

  if (isKeycloakError(body)) {
    return new ApiError(body.error, body.error_description ?? body.error, body);
  }

  if (isSpringBootError(body)) {
    return new ApiError(body.status, body.error, body);
  }

  return new ApiError(response.status, `HTTP ${response.status}`, body);
}

export class FetchApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const requestUrl = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const method = options.method ?? 'GET';
    const requestBody = buildRequestBody(options.body);
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    };

    if (requestBody !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(requestUrl, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Sunucuya bağlanılamıyor.');
      }
      throw new ApiError('NETWORK_ERROR', 'Sunucuya bağlanılamıyor.');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    return (await response.json()) as T;
  }
}

export class UnconfiguredApiClient implements ApiClient {
  async request<T>(): Promise<T> {
    throw new Error('API client is not configured yet.');
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT');
}

export function createApiClient(baseUrl?: string): ApiClient {
  if (!baseUrl) {
    return new UnconfiguredApiClient();
  }

  return new FetchApiClient(baseUrl);
}
