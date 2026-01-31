"use client";

export default function ValentinesSpotlight({
                                                title = "VALENTINE’S",
                                                subtitle = "LIMITED EDITION",
                                                image = "/media/valentines.webp",
                                                href = "/valentines",
                                            }) {
    return (
        <section className="container py-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                {/* Titles */}
                <div className="flex flex-col justify-center text-left">
                    <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
                        {title}
                    </h2>
                    <span className="mt-1 uppercase tracking-[0.3em] text-[11px] md:text-xs text-gray-500">
                        {subtitle}
                    </span>
                </div>

                {/* CTA */}
                <a
                    href={href}
                    className="inline-flex items-center justify-center
                               rounded-full border-2 px-7 py-2.5
                               text-sm md:text-base font-medium
                               transition
                               hover:bg-black hover:text-white"
                >
                    VER TODOS
                </a>
            </div>

            {/* Image */}
            <a
                href={href}
                className="block w-full max-w-4xl mx-auto"
            >
                <img
                    src={image}
                    alt="Valentine’s Limited Edition"
                    className="w-full rounded-3xl shadow-lg object-cover
                               transition-transform duration-300
                               hover:scale-[1.015]"
                />
            </a>
        </section>
    );
}