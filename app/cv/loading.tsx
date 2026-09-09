export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-3 pb-28 pt-20 sm:px-5 sm:pt-24 md:pb-10">
      <i className="fad fa-spin fa-spinner-third fa-2x text-muted-foreground opacity-50"/>
    </main>
  );
}

// function SectionSkeleton({
//   entries,
//   compact = false,
// }: {
//   entries: number;
//   compact?: boolean;
// }) {
//   return (
//     <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
//       <header className="flex items-center gap-4 bg-[#111216] px-5 py-5 sm:px-7 sm:py-6">
//         <div className="size-12 shrink-0 rounded-2xl bg-white/10" />
//         <div className="min-w-0 flex-1 space-y-2">
//           <div className="h-2 w-28 rounded-full bg-white/10" />
//           <div className="h-6 w-48 max-w-full rounded-lg bg-white/15" />
//         </div>
//         <div className="hidden h-9 w-8 rounded-lg bg-white/10 sm:block" />
//       </header>

//       <div className="space-y-4 p-5 sm:p-7">
//         {Array.from({ length: entries }, (_, index) => (
//           <div
//             key={index}
//             className={
//               compact
//                 ? "rounded-[1.4rem] border border-border bg-muted/15 p-4"
//                 : "ml-12 rounded-[1.5rem] border border-border bg-muted/15 p-5"
//             }
//           >
//             <div className="mb-3 flex items-center gap-2">
//               <div className="h-2.5 w-7 rounded-full bg-skeleton" />
//               <div className="h-2.5 w-20 rounded-full bg-skeleton" />
//             </div>
//             <div className="mb-3 h-5 w-3/4 rounded-lg bg-skeleton" />
//             <div className="space-y-2">
//               <div className="h-3 w-full rounded-full bg-skeleton" />
//               {!compact && (
//                 <div className="h-3 w-5/6 rounded-full bg-skeleton" />
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }