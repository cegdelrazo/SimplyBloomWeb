"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PHOTOS = [
    "/media/gallery/photo-01.webp",
    "/media/gallery/photo-02.webp",
    "/media/gallery/photo-03.webp",
    "/media/gallery/photo-04.webp",
    "/media/gallery/photo-05.webp",
    "/media/gallery/photo-06.webp",
    "/media/gallery/photo-07.webp",
    "/media/gallery/photo-08.webp",
    "/media/gallery/photo-09.webp",
];

export default function PhotoStrip({
   images = DEFAULT_PHOTOS,
   height = 200,
   speed = 28, // px/s
}) {
    const list = useMemo(() => images.filter(Boolean), [images]);

    // Anchos fijos por imagen (para que no se encimen) + ancho total de UNA secuencia
    const [widths, setWidths] = useState([]);
    const [seqW, setSeqW] = useState(0);
    const [ready, setReady] = useState(false);

    // Medición de imágenes: fija width por foto y el total de la pista
    useEffect(() => {
        let alive = true;
        if (!list.length) return;

        const imgs = list.map((src) => {
            const el = new Image();
            el.src = src;
            return el;
        });

        Promise.all(
            imgs.map(
                (img) =>
                    new Promise((res) => {
                        if (img.complete && img.naturalWidth) return res();
                        img.onload = () => res();
                        img.onerror = () => res();
                    })
            )
        ).then(() => {
            if (!alive) return;

            // ancho escalado por imagen para que su altura sea = height
            const ws = imgs.map((img) => {
                const nh = img.naturalHeight || height;
                const nw = img.naturalWidth || height;
                const scale = height / Math.max(1, nh);
                return Math.max(1, Math.round(nw * scale));
            });

            const total = ws.reduce((a, b) => a + b, 0);

            setWidths(ws);
            setSeqW(total);
            setReady(true);
        });

        return () => {
            alive = false;
        };
    }, [list, height]);

    // duración (s) = ancho px / (px/s)
    const dur = Math.max(10, seqW / Math.max(10, speed));

    if (!list.length) return null;

    return (
        // Wrapper con overflow-x oculto para evitar “espacio vacío” a la derecha
        <div className="w-full select-none overflow-x-hidden">
            {/* Área del carrusel con altura fija y overflow oculto */}
            <div className="relative overflow-hidden" style={{ height }} aria-label="Carrusel de fotos">
                {/* runway: duplicamos la secuencia para loop perfecto */}
                <div
                    className={`runway h-full ${ready ? "run" : ""}`}
                    style={
                        ready
                            ? { ["--seqw"]: `${seqW}px`, ["--dur"]: `${dur}s` }
                            : undefined
                    }
                >
                    <StripSeq images={list} height={height} widths={widths} />
                    <StripSeq images={list} height={height} widths={widths} />
                </div>
            </div>

            {/* Línea rosa debajo, centrada al 90%, con margen vertical */}
            <div
                className="mx-auto h-[2px] bg-brand-pink/80 mt-8 mb-8"
                style={{ width: "90%" }}
            />

            {/* estilos locales */}
            <style jsx>{`
                /* La pista completa mide exactamente 2*seqw (dos secuencias) y no debe afectar layout */
                :global(.runway) {
                    display: flex;                 /* antes inline-flex */
                    align-items: center;
                    gap: 0;
                    line-height: 0;
                    will-change: transform;
                    width: calc(var(--seqw) * 2);  /* 🔒 ancho exacto de dos secuencias */
                    transform: translate3d(0, 0, 0);
                }
                :global(.runway.run) {
                    animation: marquee var(--dur) linear infinite;
                    animation-play-state: running;
                }
                :global(.runway.run:hover) {
                    animation-play-state: paused;
                }
                @media (prefers-reduced-motion: reduce) {
                    :global(.runway.run) {
                        animation: none;
                    }
                }

                /* Cada secuencia: ancho real, sin flexión y sin gaps */
                :global(.strip-seq) {
                    display: flex;     /* antes inline-flex */
                    height: 100%;
                    gap: 0;            /* sin espacios entre fotos */
                    flex: none;        /* no crecer/encoger */
                }
                :global(.strip-seq > figure) {
                    margin: 0;
                    padding: 0;
                    display: block;
                    height: 100%;
                    flex: none;        /* ancho fijo por frame */
                }
                :global(.strip-seq img) {
                    display: block;
                    height: 100%;
                    width: 100%;
                    object-fit: contain;   /* foto completa visible */
                    object-position: center;
                    border: 0;
                }

                @keyframes marquee {
                    from { transform: translate3d(0, 0, 0); }
                    to   { transform: translate3d(calc(var(--seqw) * -1), 0, 0); }
                }
            `}</style>
        </div>
    );
}

function StripSeq({ images, height, widths }) {
    return (
        <div className="strip-seq" style={{ height }}>
            {images.map((src, i) => (
                <figure
                    key={i}
                    className="shrink-0"
                    style={{
                        width: widths[i] ? `${widths[i]}px` : "1px", // ancho fijo por foto
                        visibility: widths[i] ? "visible" : "hidden", // evita solapes/parpadeo
                    }}
                >
                    <img src={src} alt="" loading={i < 4 ? "eager" : "lazy"} />
                </figure>
            ))}
        </div>
    );
}