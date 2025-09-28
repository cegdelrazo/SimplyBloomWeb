import PhotoStrip from "./InfiniteStrip";

export const metadata = {
    title: "Eventos y Talleres | SimplyBloom",
    description:
        "Creamos y personalizamos experiencias con flores: eventos, talleres y mayoreo por ciudad.",
};

const cities = ["CDMX", "GDL", "MTY"];

export default function EventosTalleresPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* ======= CIUDADES ======= */}
            <section className="max-w-4xl mx-auto px-4 py-6">
                <div
                    aria-label="Ciudades disponibles"
                    className="flex items-center justify-center gap-4 md:gap-8"
                >
                    {cities.map((label) => (
                        <span
                            key={label}
                            className="rounded-full border border-gray-800/70 px-6 py-2 md:px-8 md:py-2.5
                         text-sm md:text-base bg-white shadow-sm select-none"
                        >
              {label}
            </span>
                    ))}
                </div>
            </section>

            {/* ======= EVENTOS ======= */}
            <section className="max-w-5xl mx-auto px-4 py-10">
                <h2 className="text-center font-serif text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                    EVENTOS
                </h2>
                <p className="text-center text-gray-700 leading-relaxed max-w-3xl mx-auto">
                    Tú imagínalo, nosotras lo creamos y personalizamos. Contamos con distintos tamaños y
                    precios especiales de mayoreo para decoración, regalo o cualquier ocasión. Selecciona tu
                    ubicación y te mandamos la información directamente.
                </p>
            </section>

            {/* ======= CARRUSEL INFINITO (EVENTOS) ======= */}
            <section className="w-full">
                <PhotoStrip
                    images={Array.from({ length: 10 }, (_, i) => `/events/gallery/events/${i + 1}.jpg`)}
                    speed={28} height={240} gap={0}
                />
            </section>

            {/* ======= TALLERES ======= */}
            <section className="max-w-5xl mx-auto px-4 py-10">
                <h2 className="text-center font-serif text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                    TALLERES
                </h2>
                <p className="text-center text-gray-700 leading-relaxed max-w-3xl mx-auto">
                    Una experiencia guiada en la que cada persona crea su propio ramo. Nosotras proporcionamos
                    las flores, guiamos paso a paso y al final colocamos una plantilla diseñada especialmente
                    para la ocasión. Actividad única, creativa y 100% personalizada.
                </p>
            </section>

            {/* ======= CARRUSEL INFINITO (TALLERES) ======= */}
            <section className="w-full pb-16">
                <PhotoStrip
                    images={Array.from({ length: 16 }, (_, i) => `/events/gallery/talleres/${i + 1}.jpg`)}
                    speed={28} height={240} gap={0}
                />
            </section>
        </main>
    );
}