"use client";

import { useEffect, useRef } from "react";

export default function IntroHero() {
    const videoRef = useRef(null);

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        // Autoplay seguro en móviles (muted + playsInline)
        const play = () => vid.play().catch(() => {});
        play();

        // Pausar si sale de viewport
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) vid.play().catch(() => {});
                    else vid.pause();
                });
            },
            { threshold: 0.3 }
        );
        io.observe(vid);
        return () => io.disconnect();
    }, []);

    return (
        <section className="w-full">
            <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Texto */}
                <div>
                    <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
                        Not Your Ordinary{" "}
                        <span className="italic font-serif">Flower Bouquet.</span>
                    </h2>

                    <div className="mt-6 text-base md:text-lg leading-relaxed space-y-2">
                        <p>
                            En Simply Bloom, cada arreglo va envuelto con una plantilla diseñada
                            especialmente para ti.
                        </p>
                        <p>
                            La experiencia comienza desde el empaque: una caja pensada para
                            sorprender, con tu arreglo cuidadosamente acomodado y su plantilla
                            en versión chica.
                        </p>
                        <p>
                            Personaliza y sorprende con un detalle que se queda.
                        </p>
                    </div>
                </div>

                {/* Video */}
                <div className="relative">

                    <div className="relative w-full overflow-hidden rounded-xl">
                        {/* Aspect ratio responsive */}
                        <div className="relative w-full" style={{ paddingTop: "62%" }}>
                            <video
                                ref={videoRef}
                                className="absolute inset-0 h-full w-full object-cover"
                                poster="/media/intro-poster.webp"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src="/media/intro.webm" type="video/webm" />
                                <source src="/media/intro.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </div>

            {/* Línea rosa inferior centrada con margen vertical */}
            <div className="mx-auto my-8 h-[2px] bg-brand-pink/80" style={{ width: "90%" }} />
        </section>
    );
}