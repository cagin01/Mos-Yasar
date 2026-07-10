// app/(tabs)/index.tsx
import RequestListScreen from "@/src/features/request/screens/RequestListScreen";

// Sadece yönlendirici görevinde. Tüm mantık src içinde.
export default function Index() {
  return <RequestListScreen />;
}