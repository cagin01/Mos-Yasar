// app/(tabs)/index.tsx
import RequestHistoryScreen from "@/src/features/request/screens/RequestHistoryScreen";

// Sadece yönlendirici görevinde. Tüm mantık src içinde.
export default function Index() {
  return <RequestHistoryScreen />;
}