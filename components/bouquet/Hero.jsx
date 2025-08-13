"use client";

import Link from "next/link";

export default function Hero({ src, title, subtitle }) {
    return (
        <section className="relative border-b">
            <div className="relative h-[240px] md:h-[320px] w-full overflow-hidden">
                <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="container py-4 md:py-6">
                        <Link
                            href="/#productos"
                            className="inline-flex items-center gap-2 text-white/90 text-sm hover:text-white"
                        >
                            <span aria-hidden>←</span> Volver a productos
                        </Link>
                        <h1 className="mt-2 text-2xl md:text-4xl font-serif italic tracking-tight text-white">
                            {title}
                        </h1>
                        <p className="mt-1 text-white/90 text-sm md:text-lg">{subtitle}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}