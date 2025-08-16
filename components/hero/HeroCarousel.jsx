"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// Preload con decode() + devolvemos dimensiones naturales
function preloadWithSize(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () =>
            resolve({
                naturalWidth: img.naturalWidth || 1,
                naturalHeight: img.naturalHeight || 1,
            });
        img.onerror = () =>
            resolve({
                naturalWidth: 1,
                naturalHeight: 1,
            });
        img.src = src;
        if (img.decode) img.decode().then(() => {}).catch(() => {});
    });
}

function isMobileViewport() {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(max-width: 767.98px)").matches;
}

// Crossfade con doble buffer + preload, y auto-height en móvil según aspecto
function CrossfadeImage({
                            src,
                            alt = "",
                            fade = 1600,
                            priority = false,
                            containOnMobile = true,
                        }) {
    const [layers, setLayers] = useState([
        { src, show: true },
        { src, show: false },
    ]);
    const activeRef = useRef(0);

    // Mantener relación de aspecto actual para móvil
    const [aspect, setAspect] = useState(9 / 16); // fallback
    const containerRef = useRef(null);

    // Recalcular altura del contenedor en móvil según ancho*aspect
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        function applyHeight() {
            if (!isMobileViewport()) {
                // En md+ el alto lo pone el padre (100dvh - navbar)
                el.style.height = "100%";
                return;
            }
            // En móvil altura en px según ancho disponible
            const w = el.clientWidth || el.getBoundingClientRect().width || 0;
            const h = Math.round(w * aspect);
            el.style.height = `${h}px`;
        }

        applyHeight();
        window.addEventListener("resize", applyHeight);
        const ro =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(applyHeight)
                : null;
        if (ro) ro.observe(el);

        return () => {
            window.removeEventListener("resize", applyHeight);
            if (ro) ro.disconnect();
        };
    }, [aspect]);

    useEffect(() => {
        let cancelled = false;
        const next = activeRef.current ^ 1;
        (async () => {
            const { naturalWidth, naturalHeight } = await preloadWithSize(src);
            if (cancelled) return;

            const newAspect =
                naturalWidth > 0 ? naturalHeight / naturalWidth : aspect;
            setAspect(newAspect);

            setLayers((s) => {
                const c = [...s];
                c[next] = { src, show: false };
                return c;
            });

            // doble RAF para asegurar el frame antes del crossfade
            requestAnimationFrame(() => {
                if (cancelled) return;
                requestAnimationFrame(() => {
                    if (cancelled) return;
                    activeRef.current = next;
                    setLayers((s) => {
                        const c = [...s];
                        c[next].show = true;
                        c[next ^ 1].show = false;
                        return c;
                    });
                });
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [src]);

    return (
        <div
            ref={containerRef}
            className={clsx(
                // Contenedor: en móvil altura dinámica (inline style), en md+ ocupa todo
                "relative w-full overflow-hidden h-auto md:h-full m-0 p-0"
            )}
        >
            {layers.map((l, i) => (
                <img
                    key={i + l.src}
                    src={l.src}
                    alt={alt}
                    fetchPriority={priority && i === activeRef.current ? "high" : "auto"}
                    className={clsx(
                        "absolute inset-0 w-full transition-opacity will-change-[opacity]",
                        // Altura:
                        "h-auto md:h-full",
                        // Ajuste de imagen:
                        // - Móvil: imagen completa, pegada arriba
                        // - md+: cover centrado
                        containOnMobile
                            ? "object-contain object-top md:object-cover md:object-center"
                            : "object-cover object-center",
                        l.show ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                        transitionDuration: `${fade}ms`,
                        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                />
            ))}
        </div>
    );
}

/**
 * En móvil: altura automática (sin huecos) según aspecto real de cada imagen.
 * En md+: hero a pantalla completa (menos navbar fija).
 */
export default function HeroCarousel({
                                         images = [],
                                         step = 5000,
                                         fade = 1600,
                                         random = true,
                                         navbarHeight = 64, // h-16
                                     }) {
    const n = images.length;
    const [idx, setIdx] = useState(0);
    const timerRef = useRef();

    useEffect(() => {
        if (!n) return;
        const pickNext = (curr) => {
            if (!random) return (curr + 1) % n;
            if (n === 1) return 0;
            let r;
            do r = Math.floor(Math.random() * n);
            while (r === curr);
            return r;
        };
        timerRef.current = setInterval(() => setIdx((i) => pickNext(i)), step);
        return () => clearInterval(timerRef.current);
    }, [n, step, random]);

    if (!n) return null;

    return (
        <section
            className={clsx(
                "relative w-full overflow-hidden m-0 p-0",
                // OJO: ahora SIEMPRE aplicamos la clase custom hero-h (sin md:)
                "hero-h"
            )}
        >
            {/* En md+: pantalla completa menos la navbar (la media query limita el efecto a desktop) */}
            <style>{`
        @media (min-width: 768px) {
          .hero-h {
            height: calc(100dvh - ${navbarHeight}px);
            min-height: calc(100svh - ${navbarHeight}px);
          }
        }
      `}</style>

            <CrossfadeImage
                src={images[idx]}
                fade={fade}
                alt="SimplyBloom"
                priority
                containOnMobile
            />
        </section>
    );
}