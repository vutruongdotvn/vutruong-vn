import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import ContactForm from "@/components/contact/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Liên hệ",
    description: "Liên hệ - cộng tác - trao đổi công việc với Vũ Trường.",
    alternates: {
        canonical: "/blog/about",
    },
};

export default function BlogAboutPage() {
    return (
        <PremiumGlassCard className="w-full" contentClassName="p-4">
            <ContactForm />
        </PremiumGlassCard>
    );
}