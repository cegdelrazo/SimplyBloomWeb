"use client";

export default function MessageNote({ title, message }) {
    if (!title && !message) return null;
    return (
        <div className="max-w-xl rounded-2xl bg-pink-50 px-4 py-3 text-sm text-gray-800 relative">
            {title && <div className="font-semibold text-pink-700">{title}</div>}
            {message && <p className="mt-1 text-gray-700 leading-relaxed">{message}</p>}
            <div className="absolute -left-2 top-3 h-4 w-4 rotate-45 bg-pink-50 border-l border-t border-pink-100"></div>
        </div>
    );
}