import AboutHero from "@/components/about/AboutHero";
import AboutProjects from "@/components/about/AboutProjects";
import AboutSocials from "@/components/about/AboutSocials";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import ContactForm from "@/components/contact/ContactForm";
export default function AboutPage() {
    return (
        <PremiumGlassCard className="w-6xl max-w-screen mx-auto" contentClassName="p-6">
            <div className="flex flex-col space-y-8 sm:space-y-10">
                <AboutHero />
                <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                <AboutSocials />
                <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                <AboutProjects />
                <div className="h-px w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                <ContactForm/>
            </div>
        </PremiumGlassCard>
    );
}