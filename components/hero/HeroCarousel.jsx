"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// Preload con decode() para evitar parpadeos
function preload(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
        if (img.decode) img.decode().then(resolve).catch(resolve);
    });
}

// Crossfade suave con doble buffer + preload
function CrossfadeImage({ src, alt = "", fade = 1600, priority = false }) {
    const [layers, setLayers] = useState([
        { src, show: true },
        { src, show: false },
    ]);
    const activeRef = useRef(0);

    useEffect(() => {
        let cancelled = false;
        const next = activeRef.current ^ 1;
        (async () => {
            await preload(src);
            if (cancelled) return;
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
        return () => { cancelled = true; };
    }, [src]);

    return (
        <div className="relative h-full w-full">
            {layers.map((l, i) => (
                <img
                    key={i + l.src}
                    src={l.src}
                    alt={alt}
                    fetchPriority={priority && i === activeRef.current ? "high" : "auto"}
                    className={clsx(
                        "absolute inset-0 h-full w-full object-cover object-center",
                        "transition-opacity will-change-[opacity]",
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
 * Hero a pantalla completa (menos navbar fija).
 * step: cada cuánto cambia; fade: duración del crossfade.
 */
export default function HeroCarousel({
     images = [],
     step = 5000,
     fade = 1600,
     random = true,
     navbarHeight = 64, // tu Navbar h-16
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
            do r = Math.floor(Math.random() * n); while (r === curr);
            return r;
        };
        timerRef.current = setInterval(() => setIdx((i) => pickNext(i)), step);
        return () => clearInterval(timerRef.current);
    }, [n, step, random]);

    if (!n) return null;

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{
                height: `calc(100dvh - ${navbarHeight}px)`,
                minHeight: `calc(100svh - ${navbarHeight}px)`,
            }}
        >
            <CrossfadeImage src={images[idx]} fade={fade} alt="SimplyBloom" priority />
        </section>
    );
}