import AboutHero from "@/components/about/AboutHero";
import AboutProjects from "@/components/about/AboutProjects";
import AboutSocials from "@/components/about/AboutSocials";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

export default function AboutPage() {
    return (
        <PremiumGlassCard className="w-6xl max-w-screen mx-auto">
            <div className="flex flex-col space-y-4 sm:space-y-8">
                <AboutHero />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <AboutSocials />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <AboutProjects />
            </div>
        </PremiumGlassCard>
    );
}