// app/layout.jsx
import "./globals.css";
import Navbar from "@/components/shared/Navbar";

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
            {/* Opcional: redundante pero válido si quieres forzar */}
            <meta name="theme-color" content="#b9141a" />
            <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#b9141a" />
        </head>
        <body className="bg-white text-gray-900">
        <Navbar />
        {/* Compensa la barra fija (h-16) para que el contenido no quede debajo */}
        <div className="pt-16 md:pt-16">{children}</div>
        </body>
        </html>
    );
}