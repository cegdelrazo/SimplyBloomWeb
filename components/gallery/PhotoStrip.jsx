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
                                       speed = 28,             // px/s para el marquee automático
                                       buttonSpeed = 600,      // px/s cuando mantienes presionado un botón en desktop
                                   }) {
    const list = useMemo(() => images.filter(Boolean), [images]);

    // Medidas por imagen y ancho total de UNA secuencia
    const [widths, setWidths] = useState([]);
    const [seqW, setSeqW] = useState(0);
    const [ready, setReady] = useState(false);

    // Responsivo
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, []);

    // Refs estructura y estados
    const surfaceRef = useRef(null);
    const wrapRef = useRef(null);      // translateX manual (CSS var --offset)
    const runwayRef = useRef(null);    // animación automática (CSS)

    // Drag móvil
    const draggingRef = useRef(false);
    const rawOffsetRef = useRef(0);    // offset crudo (sin modular)
    const dragStartXRef = useRef(0);
    const dragStartOffsetRef = useRef(0);

    // Botones desktop (presionado continuo)
    const btnDirRef = useRef(0);       // -1 izquierda, +1 derecha, 0 none
    const btnRafRef = useRef(null);
    const lastTickRef = useRef(0);

    // Medición de imágenes
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

    // Duración del marquee automático
    const dur = Math.max(10, seqW / Math.max(10, speed));

    // Aplica offset modularizado para loop perfecto (visual), manteniendo crudo
    const applyTransform = (rawPx) => {
        rawOffsetRef.current = rawPx;
        let bounded = rawPx;
        if (seqW > 0) {
            bounded = ((rawPx % seqW) + seqW) % seqW; // 0..seqW
            bounded = bounded - seqW;                 // -seqW..0
        }
        if (wrapRef.current) {
            wrapRef.current.style.setProperty("--offset", `${bounded}px`);
        }
    };

    // Pausar/Reanudar marquee
    const pauseRunway = (paused) => {
        if (!runwayRef.current) return;
        if (paused) runwayRef.current.classList.add("paused");
        else runwayRef.current.classList.remove("paused");
    };

    // ====== Drag móvil (solo < md) ======
    const getClientX = (ev) => {
        if (typeof ev.clientX === "number") return ev.clientX;
        if (ev.touches && ev.touches[0]) return ev.touches[0].clientX;
        if (ev.changedTouches && ev.changedTouches[0]) return ev.changedTouches[0].clientX;
        return 0;
    };

    const startDrag = (ev) => {
        if (!ready || isDesktop) return; // no drag en desktop
        draggingRef.current = true;
        dragStartXRef.current = getClientX(ev);
        dragStartOffsetRef.current = rawOffsetRef.current;

        pauseRunway(true);

        const el = surfaceRef.current;
        el?.classList.add("dragging");
        el?.setPointerCapture?.(ev.pointerId);

        // listeners globales (por si el dedo sale del área)
        window.addEventListener("pointermove", onGlobalMove, { passive: false });
        window.addEventListener("pointerup", endDrag, { passive: false });
        window.addEventListener("touchmove", onGlobalMove, { passive: false });
        window.addEventListener("touchend", endDrag, { passive: false });
        window.addEventListener("touchcancel", endDrag, { passive: false });
    };

    const onGlobalMove = (ev) => {
        if (!draggingRef.current) return;
        ev.preventDefault(); // clave en iOS
        const x = getClientX(ev);
        const dx = x - dragStartXRef.current;
        applyTransform(dragStartOffsetRef.current + dx);
    };

    const endDrag = (ev) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;

        window.removeEventListener("pointermove", onGlobalMove);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("touchmove", onGlobalMove);
        window.removeEventListener("touchend", endDrag);
        window.removeEventListener("touchcancel", endDrag);

        const el = surfaceRef.current;
        if (el) {
            el.classList.remove("dragging");
            el.releasePointerCapture?.(ev.pointerId);
        }

        pauseRunway(false); // reanuda marquee desde la posición actual
    };

    // ====== Botones desktop (mantener presionado) ======
    const tickButtons = (tNow) => {
        const dir = btnDirRef.current;
        if (!dir) {
            btnRafRef.current = null;
            pauseRunway(false);
            return;
        }
        const prev = lastTickRef.current || tNow;
        const dt = Math.max(0, tNow - prev); // ms
        lastTickRef.current = tNow;

        // mover según buttonSpeed (px/s)
        const dx = dir * buttonSpeed * (dt / 1000);
        applyTransform(rawOffsetRef.current + dx);

        btnRafRef.current = requestAnimationFrame(tickButtons);
    };

    const onButtonPress = (dir) => {
        if (!ready || !isDesktop) return;
        btnDirRef.current = dir; // -1 izquierda, +1 derecha
        pauseRunway(true);
        lastTickRef.current = performance.now();
        if (!btnRafRef.current) btnRafRef.current = requestAnimationFrame(tickButtons);
    };

    const onButtonRelease = () => {
        btnDirRef.current = 0;
        if (btnRafRef.current) {
            cancelAnimationFrame(btnRafRef.current);
            btnRafRef.current = null;
        }
        pauseRunway(false);
    };

    // Accesibilidad: flechas del teclado en desktop
    useEffect(() => {
        if (!isDesktop) return;
        const onKey = (e) => {
            if (e.key === "ArrowLeft") {
                onButtonPress(-1);
            } else if (e.key === "ArrowRight") {
                onButtonPress(1);
            }
        };
        const onKeyUp = (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                onButtonRelease();
            }
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [isDesktop]);

    if (!list.length) return null;

    return (
        <div className="w-full select-none overflow-x-hidden">
            <div
                ref={surfaceRef}
                className="relative overflow-hidden drag-surface"
                style={{ height }}
                aria-label="Carrusel de fotos"
                // Drag solo móvil
                onPointerDown={startDrag}
                onTouchStart={startDrag}
            >
                {/* Wrapper desplazable (offset manual). */}
                <div ref={wrapRef} className="runway-wrap h-full">
                    {/* Pista duplicada para loop infinito */}
                    <div
                        ref={runwayRef}
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

                {/* Botones solo en desktop */}
                <div className="hidden md:flex items-center justify-between absolute inset-0 pointer-events-none">
                    <button
                        type="button"
                        aria-label="Desplazar a la izquierda"
                        className="pointer-events-auto ml-2 rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur px-3 py-3"
                        onMouseDown={() => onButtonPress(-1)}
                        onMouseUp={onButtonRelease}
                        onMouseLeave={onButtonRelease}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        aria-label="Desplazar a la derecha"
                        className="pointer-events-auto mr-2 rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur px-3 py-3"
                        onMouseDown={() => onButtonPress(1)}
                        onMouseUp={onButtonRelease}
                        onMouseLeave={onButtonRelease}
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Línea rosa debajo */}
            <div
                className="mx-auto h-[2px] bg-brand-pink/80 mt-8 mb-8"
                style={{ width: "90%" }}
            />

            <style jsx>{`
        /* Superficie: móvil permite scroll vertical; durante drag bloquea para fluidez */
        :global(.drag-surface) {
          touch-action: pan-y;
          cursor: default;
          overscroll-behavior: contain;
        }
        :global(.drag-surface.dragging) {
          touch-action: none;
          cursor: grabbing !important;
        }

        /* Wrapper con offset manual (modularizado en applyTransform) */
        :global(.runway-wrap) {
          height: 100%;
          will-change: transform;
          transform: translate3d(var(--offset, 0px), 0, 0);
        }

        /* Pista con marquee automático (pausado durante drag/botón) */
        :global(.runway) {
          display: flex;
          align-items: center;
          gap: 0;
          line-height: 0;
          will-change: transform;
          width: calc(var(--seqw) * 2); /* dos secuencias pegadas */
          transform: translate3d(0, 0, 0);
        }
        :global(.runway.run) {
          animation: marquee var(--dur) linear infinite;
          animation-play-state: running;
        }
        :global(.runway.paused) {
          animation-play-state: paused !important;
        }
        @media (hover: hover) and (pointer: fine) {
          /* opcional: pausar al hover en desktop (quítalo si no lo quieres) */
          :global(.runway.run:hover) {
            animation-play-state: paused;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.runway.run) {
            animation: none;
          }
        }

        /* Secuencia con anchos fijos */
        :global(.strip-seq) {
          display: flex;
          height: 100%;
          gap: 0;
          flex: none;
        }
        :global(.strip-seq > figure) {
          margin: 0;
          padding: 0;
          display: block;
          height: 100%;
          flex: none;
        }
        :global(.strip-seq img) {
          display: block;
          height: 100%;
          width: 100%;
          object-fit: contain;
          object-position: center;
          border: 0;
        }

        /* Marquee: recorre exactamente una secuencia */
        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(calc(var(--seqw) * -1), 0, 0);
          }
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
                        width: widths[i] ? `${widths[i]}px` : "1px",
                        visibility: widths[i] ? "visible" : "hidden",
                    }}
                >
                    <img src={src} alt="" loading={i < 4 ? "eager" : "lazy"} />
                </figure>
            ))}
        </div>
    );
}