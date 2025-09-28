"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import {safeUUID} from "@/utils/ids";

const DEFAULT_MAX_IMAGES = 4;
const DEFAULT_MAX_MB = 3;
const BYTES_IN_MB = 1024 * 1024;

function formatMB(bytes = 0) {
    return (bytes / BYTES_IN_MB).toFixed(1) + " MB";
}

function buildImageModels(files) {
    return files.map((f) => ({
        id: safeUUID(),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        previewUrl: URL.createObjectURL(f),
        file: f,
    }));
}

/**
 * Muestra y gestiona imágenes del item del carrito con:
 * - Agregar (input file)
 * - Eliminar una / todas
 * - Validación de tamaño y límite total
 *
 * images: [{ id, name, size, type, previewUrl, file }]
 */
export default function ImagesStrip({
                                        lineId,
                                        images = [],
                                        maxImages = DEFAULT_MAX_IMAGES,
                                        maxSizeMB = DEFAULT_MAX_MB,
                                    }) {
    const { dispatch } = useGlobalContext();
    const fileRef = useRef(null);
    const [localError, setLocalError] = useState("");

    const remainingSlots = useMemo(
        () => Math.max(0, maxImages - (images?.length || 0)),
        [images?.length, maxImages]
    );

    const revokePreview = (m) => {
        try {
            if (m?.previewUrl) URL.revokeObjectURL(m.previewUrl);
        } catch (_) {}
    };

    const setImages = (next) => {
        dispatch({ type: "SET_ITEM_IMAGES", payload: { lineId, images: next } });
    };

    const removeOne = useCallback(
        (imageId) => {
            const img = images.find((m) => m.id === imageId);
            if (img) revokePreview(img);
            const next = images.filter((m) => m.id !== imageId);
            setImages(next);
        },
        [images, lineId]
    );

    const clearAll = useCallback(() => {
        for (const m of images) revokePreview(m);
        setImages([]);
    }, [images, lineId]);

    const handlePickClick = () => {
        setLocalError("");
        fileRef.current?.click();
    };

    const handleFilesSelected = (fileList) => {
        setLocalError("");
        const picked = Array.from(fileList || []);
        if (picked.length === 0) return;

        const msgs = [];
        if (picked.length > remainingSlots) {
            msgs.push(
                `Solo puedes agregar ${remainingSlots} imagen(es) más (límite ${maxImages}).`
            );
        }

        const sliced = picked.slice(0, remainingSlots);
        const maxBytes = maxSizeMB * BYTES_IN_MB;

        const validFiles = [];
        for (const f of sliced) {
            if (f.size > maxBytes) {
                msgs.push(`${f.name} supera ${maxSizeMB} MB (${formatMB(f.size)}).`);
            } else {
                validFiles.push(f);
            }
        }

        if (validFiles.length === 0) {
            setLocalError(msgs.join("\n"));
            return;
        }

        const newModels = buildImageModels(validFiles);
        setImages([...(images || []), ...newModels]);

        if (msgs.length) setLocalError(msgs.join("\n"));
    };

    const onInputChange = (e) => handleFilesSelected(e.target.files);

    // Drag & drop opcional (suave)
    const onDrop = (e) => {
        e.preventDefault();
        if (remainingSlots <= 0) return setLocalError("Alcanzaste el límite de imágenes.");
        handleFilesSelected(e.dataTransfer.files);
    };
    const onDragOver = (e) => e.preventDefault();

    const AddButton = () => (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={handlePickClick}
                className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50"
            >
                Agregar imágenes
            </button>
        </div>
    );

    return (
        <section className="space-y-2">
            {/* Header y acciones */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                    Imágenes seleccionadas
                    <span className="ml-2 text-xs text-gray-500">
            ({images.length}/{maxImages})
          </span>
                </h4>

                <div className="flex items-center gap-4">
                    <AddButton />
                    {images.length > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-red-600 hover:underline"
                            aria-label="Eliminar todas las imágenes"
                        >
                            Quitar todas
                        </button>
                    )}
                </div>
            </div>

            {/* Zona de drop + grid */}
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="border border-dashed rounded-md p-3"
                title="Arrastra y suelta tus imágenes aquí"
            >
                {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-sm text-gray-600">
                            Aún no has agregado imágenes.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((m) => (
                            <figure
                                key={m.id}
                                className="relative border rounded-lg overflow-hidden bg-white"
                                title={`${m.name} — ${formatMB(m.size)}`}
                            >
                                <img
                                    src={m.previewUrl}
                                    alt={m.name}
                                    className="w-full h-28 object-cover"
                                    loading="lazy"
                                />
                                <figcaption className="px-2 py-1 text-[11px] text-gray-600 truncate">
                                    {m.name}
                                </figcaption>

                                <button
                                    type="button"
                                    onClick={() => removeOne(m.id)}
                                    className="absolute top-1 right-1 rounded-full bg-white/90 border text-[11px] px-2 py-0.5 hover:bg-white"
                                    aria-label={`Eliminar ${m.name}`}
                                >
                                    ✕
                                </button>
                            </figure>
                        ))}
                    </div>
                )}
            </div>

            {/* Error local multi-línea */}
            {localError && (
                <div className="text-xs text-red-600 whitespace-pre-line">{localError}</div>
            )}

            {/* input file oculto */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onInputChange}
            />
        </section>
    );
}