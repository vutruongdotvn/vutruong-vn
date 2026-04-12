import type { Metadata } from "next";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.vutruong.vn"),

    title: {
        default: "VT Watch",
        template: "%s",
    },

    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },

    openGraph: {
        siteName: "VT Watch",
        locale: "vi_VN",
        type: "video.movie",
    },

    twitter: {
        card: "summary_large_image",
    },
};

export default function WatchSlugLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}