import AboutHero from "@/components/about/AboutHero";
import AboutProjects from "@/components/about/AboutProjects";
import AboutSocials from "@/components/about/AboutSocials";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
// import ContactForm from "@/components/contact/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Giới thiệu về Vũ Trường - liên két mạng xã hội - những dự án cá nhân đã làm.",
  alternates: {
    canonical: "/blog/about",
  },
};

export default function BlogAboutPage() {
  return (
    <PremiumGlassCard className="w-6xl max-w-full px-0 sm:px-4" contentClassName="p-4">
      <div className="flex flex-col space-y-8 sm:space-y-10">
        <AboutHero />
        <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
        <AboutSocials />
        <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
        <AboutProjects />
      </div>
    </PremiumGlassCard>
  );
}