export default function OptionsList({ options = {} }) {
    const { city, date, title, message, imagesCount } = options || {};
    return (
        <ul className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {city ? <li><span className="font-medium">Ciudad:</span> {city}</li> : null}
            {date ? <li><span className="font-medium">Entrega:</span> {date}</li> : null}
            {title ? <li className="md:col-span-2"><span className="font-medium">Título:</span> {title}</li> : null}
            {message ? <li className="md:col-span-2"><span className="font-medium">Mensaje:</span> {message}</li> : null}
            {imagesCount > 0 ? <li><span className="font-medium">Fotos:</span> {imagesCount}</li> : null}
        </ul>
    );
}