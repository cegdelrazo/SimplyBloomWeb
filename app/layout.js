// app/layout.

import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import {GlobalProvider} from "@/app/context/globalContext";

export const metadata = {
    title: "SimplyBloom",
    description: "Not your ordinary flower bouquet.",
    icons: [{ rel: "icon", url: "/logo.svg" }],
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#b9141a" },
        { media: "(prefers-color-scheme: dark)",  color: "#b9141a" },
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <meta name="theme-color" content="#b9141a" />
                <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#b9141a" />
                <title>Simply Bloom</title>
            </head>
            <body className="bg-white text-gray-900">
                <GlobalProvider>
                    <Navbar />
                    <div className="pt-16 md:pt-16">{children}</div>
                </GlobalProvider>
            </body>
        </html>
    );
}