import WatchGuard from "@/components/watch/WatchGuard";

export default function BrowseProtectedLayout({ children }: { children: React.ReactNode }) {
  return <WatchGuard>{children}</WatchGuard>;
}