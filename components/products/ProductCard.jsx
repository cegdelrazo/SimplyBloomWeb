"use client";

import Link from "next/link";
import clsx from "clsx";

export default function ProductCard({
                                        id,
                                        img,
                                        name,
                                        subtitle,
                                        price,
                                        variant = "grid", // "grid" | "carousel"
                                        className,
                                    }) {
    const rootClasses = clsx(
        "group cursor-pointer h-full",
        variant === "carousel"
            ? "shrink-0 snap-start w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]" // ancho responsivo horizontal
            : "w-full", // grid ocupa toda la celda
        className
    );

    return (
        <Link href={`/bouquet/${id}`} className="block h-full">
            <article className={rootClasses}>
                {/* Imagen con proporción cuadrada (o 3:4 si prefieres) */}
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

                {/* Divider */}
                <div className="h-px bg-brand-pink my-2" />

                {/* Texto */}
                <div>
                    <h3 className="font-serif italic text-[15px] leading-none">{name}</h3>
                    {subtitle && (
                        <p className="mt-1 text-[14px] leading-snug text-gray-800">{subtitle}</p>
                    )}
                </div>
            </article>
        </Link>
    );
}