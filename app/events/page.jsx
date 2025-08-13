"use client";

import PhotoStrip from "@/components/gallery/PhotoStrip";

const EVENTOS_PHOTOS = [
    "/media/eventos/e-01.webp",
    "/media/eventos/e-02.webp",
    "/media/eventos/e-03.webp",
    "/media/eventos/e-04.webp",
    "/media/eventos/e-05.webp",
    "/media/eventos/e-06.webp",
];

const TALLERES_PHOTOS = [
    "/media/talleres/t-01.webp",
    "/media/talleres/t-02.webp",
    "/media/talleres/t-03.webp",
    "/media/talleres/t-04.webp",
    "/media/talleres/t-05.webp",
    "/media/talleres/t-06.webp",
];

export default function EventosPage() {
    return (
        <main className="pt-20"> {/* separa de la navbar fija */}
            {/* Hero / título */}
            <section className="container py-6 md:py-10 text-center">
                <h1 className="font-serif text-xl md:text-2xl tracking-wide italic">
                    EVENTOS Y TALLERES
                </h1>
            </section>

            {/* Banner / imagen hero (opcional) */}
            {/* <img src="/media/eventos/hero.webp" className="w-full h-auto" alt="" /> */}
            <div className="mx-auto my-4 h-[2px] bg-brand-pink/80" style={{ width: "90%" }} />

            {/* Selector de ciudad */}
            <section className="container py-6">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <CityButton label="CDMX" href="https://wa.me/52XXXXXXXXXX?text=Eventos%20CDMX" />
                    <CityButton label="GDL"  href="https://wa.me/52XXXXXXXXXX?text=Eventos%20GDL" />
                    <CityButton label="MTY"  href="https://wa.me/52XXXXXXXXXX?text=Eventos%20MTY" />
                </div>
            </section>

            {/* Eventos */}
            <section className="container text-center py-8 md:py-12 scroll-mt-24" id="eventos">
                <h2 className="font-serif text-3xl md:text-4xl">EVENTOS</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg">
                    Tú imagínalo, nosotras lo creamos y personalizamos.
                    Contamos con distintos tamaños y precios especiales de mayoreo para decoración, regalo o cualquier ocasión.
                    Selecciona tu ubicación y te mandamos la información directamente.
                </p>

                <div className="mt-8">
                    <PhotoStrip images={EVENTOS_PHOTOS} height={180} speed={26} />
                </div>
            </section>

            <div className="mx-auto my-6 h-[2px] bg-brand-pink/80" style={{ width: "90%" }} />

            {/* Talleres */}
            <section className="container text-center py-8 md:py-12 scroll-mt-24" id="talleres">
                <h2 className="font-serif text-3xl md:text-4xl">TALLERES</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg">
                    Una experiencia guiada en la que cada persona crea su propio ramo.
                    Nosotras proporcionamos las flores, guiamos paso a paso y al final colocamos una plantilla diseñada especialmente para la ocasión.
                    Actividad única, creativa y 100% personalizada: selecciona tu ubicación y te mandamos la info directamente.
                </p>

                <div className="mt-8">
                    <PhotoStrip images={TALLERES_PHOTOS} height={180} speed={26} />
                </div>
            </section>

            <div className="mx-auto my-10 h-[2px] bg-brand-pink/80" style={{ width: "90%" }} />
        </main>
    );
}

function CityButton({ label, href }) {
    return (
        <a
            href={href}
            className="inline-flex items-center justify-center rounded-full border px-6 py-2 text-lg font-serif hover:bg-gray-50 transition"
            target="_blank"
            rel="noopener noreferrer"
        >
            {label}
        </a>
    );
}