"use client";

import { useMemo } from "react";

/**
 * Carrusel infinito horizontal tipo "marquee".
 * - Responsivo 3:4
 *   sm: 150x200 | md: 180x240 | lg: 200x267 | xl: 260x347 | 2xl: 360x480
 * - Loop continuo (duplicación de imágenes).
 * - Se pausa al pasar el mouse (hover).
 */
export default function InfiniteStrip({
                                          images = [],
                                          speed = 40, // segundos por ciclo
                                          className = "",
                                      }) {
    const list = useMemo(() => images.filter(Boolean), [images]);
    if (!list.length) return null;

    return (
        <div
            className={`w-full overflow-hidden group ${className}`}
            aria-label="Carrusel infinito de eventos"
        >
            <div
                className="strip group-hover:[animation-play-state:paused]"
                style={{ ["--dur"]: `${speed}s` }}
            >
                {[...list, ...list].map((src, i) => (
                    <div
                        key={`${src}-${i}`}
                        className={`
              shrink-0
              w-[150px] h-[200px]
              md:w-[180px] md:h-[240px]
              lg:w-[200px] lg:h-[267px]
              xl:w-[260px] xl:h-[347px]
              2xl:w-[360px] 2xl:h-[480px]
            `}
                    >
                        <img
                            src={src}
                            alt=""
                            loading={i < list.length ? "eager" : "lazy"}
                            decoding="async"
                            className="w-full h-full object-cover select-none pointer-events-none"
                        />
                    </div>
                ))}
            </div>

            <style jsx>{`
                .strip {
                    display: flex;
                    gap: 0;
                    animation: scroll var(--dur) linear infinite;
                    will-change: transform;
                }
                @keyframes scroll {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
}