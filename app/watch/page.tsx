"use client";

import WatchHero from "@/components/watch/WatchHero";

/** The existing A2 layout/guard owns authorization and this subtree's identity. */
export default function WatchPage() {
  return <main><WatchHero /></main>;
}
