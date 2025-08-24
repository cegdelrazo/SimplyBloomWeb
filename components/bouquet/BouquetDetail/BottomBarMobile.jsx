"use client";

export default function BottomBarMobile({ total, disabled, onClick }) {
    return (
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur">
            <div className="container py-3 flex items-center justify-between">
                <div className="text-base">
                    <span className="text-gray-600 text-sm">Total</span>{" "}
                    <span className="font-semibold">${total}</span>{" "}
                    <span className="text-[10px] align-super">MXN</span>
                </div>
                <button
                    onClick={onClick}
                    className="rounded-full border px-5 py-2 text-sm font-medium disabled:opacity-60"
                    disabled={disabled}
                >
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}