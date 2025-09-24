"use client";

import Link from "next/link";

export default function ProductCard({ id, img, name, subtitle, price }) {
    return (
        <Link href={`/bouquet/${id}`}>
            <article className="group shrink-0 snap-start min-w-[220px] max-w-[260px] cursor-pointer">
                {/* Imagen cuadrada con zoom en hover */}
                <div className="overflow-hidden rounded-[20px]">
                    <div className="aspect-square w-full overflow-hidden">
                        <img
                            src={img}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Línea rosa horizontal delgada (1px) */}
                <div className="h-px bg-brand-pink my-2" />

                {/* Texto */}
                <div>
                    <div className="flex items-baseline justify-between">
                        <h3 className="font-serif italic text-[15px] leading-none">{name}</h3>
                    </div>
                    <p className="mt-1 text-[14px] leading-snug text-gray-800">{subtitle}</p>
                </div>
            </article>
        </Link>
    );
}