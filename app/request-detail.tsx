// app/(tabs)/index.tsx
import RequestDetailScreen from "@/src/features/request/screens/RequestDetailScreen";

// Sadece yönlendirici görevinde. Tüm mantık src içinde.
export default function Index() {
  return <RequestDetailScreen />;
}