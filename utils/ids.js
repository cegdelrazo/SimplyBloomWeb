
export function safeUUID() {
    const g = globalThis;
    if (g?.crypto?.randomUUID) {
        return g.crypto.randomUUID();
    }

    let bytes;
    if (g?.crypto?.getRandomValues) {
        bytes = new Uint8Array(16);
        g.crypto.getRandomValues(bytes);
    } else {
        bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0"));
    return (
        `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-` +
        `${hex[4]}${hex[5]}-` +
        `${hex[6]}${hex[7]}-` +
        `${hex[8]}${hex[9]}-` +
        `${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
    );
}