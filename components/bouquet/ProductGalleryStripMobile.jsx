// components/bouquet/ProductGalleryStripMobile.jsx
"use client";

export default function ProductGalleryStripMobile({ images = [] }) {
    if (!images.length) return null;
    return (
        <div className="md:hidden container mt-4">
            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((src, i) => (
                    <figure
                        key={i}
                        className="shrink-0 overflow-hidden rounded-xl border"
                        style={{ width: 160, height: 160 }}
                    >
                        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </figure>
                ))}
            </div>
        </div>
    );
}