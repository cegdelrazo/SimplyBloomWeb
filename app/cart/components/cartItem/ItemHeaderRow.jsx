"use client";

function formatDateMX(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const local = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Mexico_City",
    }).format(local);
}

export default function ItemHeaderRow({
                                          image,
                                          productName,
                                          productSubtitle,
                                          city,
                                          date,
                                          price,
                                      }) {
    return (
        <div className="grid grid-cols-12 items-start gap-4">
            {/* Imagen */}
            <div className="col-span-3 md:col-span-2">
                <div className="aspect-square overflow-hidden rounded-2xl border bg-gray-50 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={productName ?? "Producto"} className="h-full w-full object-cover" />
                </div>
            </div>

            {/* Título/subtítulo + chips */}
            <div className="col-span-7 md:col-span-8 min-w-0">
                <h3 className="truncate text-base md:text-lg font-semibold text-gray-900">
                    {productName}
                </h3>
                <p className="truncate text-sm text-gray-500">{productSubtitle}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {city && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
              <span className="font-medium">{city}</span>
            </span>
                    )}
                    {date && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700">
              <span className="font-medium">{formatDateMX(date)}</span>
            </span>
                    )}
                </div>
            </div>

            {/* Precio */}
            <div className="col-span-2 md:col-span-2 text-right">
        <span className="inline-block rounded-full bg-black px-4 py-1.5 text-white text-sm font-medium shadow-md tabular-nums">
          ${price}
        </span>
            </div>
        </div>
    );
}