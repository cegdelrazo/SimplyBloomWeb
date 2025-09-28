import Image from "next/image";
import SnapCarousel from "./SnapCarousel";

export const metadata = {
    title: "Eventos y Talleres | SimplyBloom",
    description:
        "Creamos y personalizamos experiencias con flores: eventos, talleres y mayoreo por ciudad.",
};

const cities = ["CDMX", "GDL", "MTY"];

export default function EventosTalleresPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* ======= HERO 1 ======= */}
            <section className="relative w-full">
                <div className="relative h-[46vh] md:h-[62vh]">
                    <Image
                        src="/events/hero-1.jpg"
                        alt="Eventos y talleres con flores"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-x-0 top-6 text-center">
                        <p className="font-serif tracking-widest text-sm md:text-base text-gray-800 drop-shadow">
                            EVENTOS Y TALLERES
                        </p>
                    </div>
                </div>
            </section>

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

            {/* ======= HERO 2 ======= */}
            <section className="relative w-full">
                <div className="relative h-[38vh] md:h-[54vh]">
                    <Image
                        src="/events/hero-2.jpg"
                        alt="Muestras de arreglos y montaje"
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
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

            {/* ======= CARRUSEL ======= */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <SnapCarousel
                    images={Array.from({ length: 10 }, (_, i) => `/events/gallery/${i + 1}.jpg`)}
                />
            </section>


        </main>
    );
}