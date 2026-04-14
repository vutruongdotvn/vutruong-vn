import React from "react";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl w-full mx-auto px-0 sm:px-4 py-26">
        {children}
    </div>
  );
}