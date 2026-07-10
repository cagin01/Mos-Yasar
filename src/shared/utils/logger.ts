const crashlytics = () => {
  try {
    const fcmName = '@react-native-firebase/crashlytics';
    return require(fcmName).default;
  } catch (e) {
    // Expo Go ortamındaysak veya kütüphane linklenmemişse null dönecek
    return null;
  }
};

const sendToRemoteServer = async (level: 'INFO' | 'WARN' | 'ERROR', message: string, payload?: any) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (level === 'ERROR') {
        const errorToRecord = payload instanceof Error ? payload : new Error(message);
        await crashlytics().recordError(errorToRecord);
      } else {
        await crashlytics().log(`[${level}] ${message} ${payload ? JSON.stringify(payload) : ''}`);
      }
    }
  } catch (remoteError) {
    console.error('[LOGGER_TRANSPORT_FAIL]', remoteError);
  }
};

export const logger = {
  info(message: string, context?: any) {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, context ? JSON.stringify(context) : '');
    sendToRemoteServer('INFO', message, context);
  },

  warn(message: string, error?: any) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, error || '');
    sendToRemoteServer('WARN', message, error);
  },  

  error(message: string, error?: any) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error || '');
    sendToRemoteServer('ERROR', message, error);
  }
};