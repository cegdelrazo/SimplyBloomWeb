// app/layout.js
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { GlobalProvider } from "@/app/context/globalContext";

export const metadata = {
    title: "SimplyBloom",
    description: "Not your ordinary flower bouquet.",
    icons: [{ rel: "icon", url: "/logo.svg" }],
};

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#b9141a" },
        { media: "(prefers-color-scheme: dark)",  color: "#b9141a" },
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
        <body className="bg-white text-gray-900">
        <GlobalProvider>
            <Navbar />
            <div className="pt-16 md:pt-16">{children}</div>
        </GlobalProvider>
        </body>
        </html>
    );
}