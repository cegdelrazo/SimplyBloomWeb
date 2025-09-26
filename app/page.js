import HeroCarousel from "@/components/hero/HeroCarousel";
import ProductsCarousel from "@/components/products/ProductsCarousel";
import PhotoStrip from "@/components/gallery/PhotoStrip";
import IntroHero from "@/components/hero/IntroHero";

export default function Home() {
    const heroImgs = [
        "/media/sb-02.webp",
        "/media/sb-03.webp",
    ];

    return (
        <main>
            <HeroCarousel images={heroImgs} step={5000} fade={1600} random navbarHeight={64} />
            <ProductsCarousel viewAllHref="/productos" />
            <PhotoStrip speed={28} height={240} gap={0} />
            <IntroHero />
        </main>
    );
}