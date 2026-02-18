// app/page.js (o donde tengas Home)
import HeroCarousel from "@/components/hero/HeroCarousel";
import ProductsCarousel from "@/components/products/ProductsCarousel";
import PhotoStrip from "@/components/gallery/PhotoStrip";
import IntroHero from "@/components/hero/IntroHero";
import Script from "next/script";
import { PRODUCTS, PRODUCTS_VALENTIN } from "@/lib/products";
import ValentinesSpotlight from "@/components/hero/ValentinesSpotlight";

export default function Home() {
    const heroImgs = ["/media/sb-02.webp", "/media/sb-03.webp"];

    // (Opcional) log en consola del servidor:
    console.log("[SERVER] ISO (UTC):", new Date().toISOString());

    return (
        <main>
            {/* Log en consola del navegador */}
            <Script id="log-time" strategy="afterInteractive">
                {`
          (function () {
            const now = new Date();
            console.log("[CLIENT] Local:", now.toString());
            console.log("[CLIENT] CDMX:", now.toLocaleString("es-MX", { timeZone: "America/Mexico_City" }));
            console.log("[CLIENT] ISO (UTC):", now.toISOString());
          })();
        `}
            </Script>

            <HeroCarousel images={heroImgs} step={5000} fade={1600} random navbarHeight={64} />
            <ProductsCarousel viewAllHref="/productos" products={PRODUCTS} />
            <PhotoStrip speed={28} height={240} gap={0} />
            <IntroHero />
        </main>
    );
}
