// lib/products.js
export const PRODUCTS = [
    {
        id: "product-01",
        img: "/media/products/product-01.webp",
        name: "Birthday 1",
        subtitle: "On This Day A Queen Was Born.",
        price: 800,
        gallery: [
            "/media/gallery/product1/photo-01.webp",
            "/media/gallery/product1/photo-02.webp",
            "/media/gallery/product1/photo-04.webp",
        ],
    },
    {
        id: "product-02",
        img: "/media/products/product-02.webp",
        name: "Congrats 1",
        subtitle: "Cheers To You.",
        price: 820,
        gallery: [
            "/media/gallery/product1/photo-01.webp",
            "/media/gallery/product1/photo-02.webp",
            "/media/gallery/product1/photo-04.webp",
        ],
    },
    // …los demás pueden ir sin gallery de momento…
    { id: "product-03", img: "/media/products/product-03.webp", name: "Birthday 2", subtitle: "More Fabulous Every Year.", price: 780 },
    { id: "product-04", img: "/media/products/product-04.webp", name: "Birthday 3", subtitle: "Iconic, Always.", price: 850 },
    { id: "product-05", img: "/media/products/product-05.webp", name: "Birthday 4", subtitle: "On This Day A Queen Was Born.", price: 810 },
    { id: "product-06", img: "/media/products/product-06.webp", name: "Congrats 2", subtitle: "Cheers To You.", price: 790 },
    { id: "product-07", img: "/media/products/product-07.webp", name: "Birthday 5", subtitle: "More Fabulous Every Year.", price: 800 },
    { id: "product-08", img: "/media/products/product-08.webp", name: "Birthday 6", subtitle: "Iconic, Always.", price: 830 },
    { id: "product-09", img: "/media/products/product-09.webp", name: "Birthday 7", subtitle: "On This Day A Queen Was Born.", price: 820 },
    { id: "product-10", img: "/media/products/product-10.webp", name: "Congrats 3", subtitle: "Cheers To You.", price: 810 },
    { id: "product-11", img: "/media/products/product-11.webp", name: "Birthday 8", subtitle: "More Fabulous Every Year.", price: 780 },
    { id: "product-12", img: "/media/products/product-12.webp", name: "Birthday 9", subtitle: "Iconic, Always.", price: 850 },
    { id: "product-13", img: "/media/products/product-13.webp", name: "Birthday 10", subtitle: "On This Day A Queen Was Born.", price: 800 },
    { id: "product-14", img: "/media/products/product-14.webp", name: "Congrats 4", subtitle: "Cheers To You.", price: 800 },
    { id: "product-15", img: "/media/products/product-15.webp", name: "Birthday 11", subtitle: "More Fabulous Every Year.", price: 800 },
    { id: "product-16", img: "/media/products/product-16.webp", name: "Birthday 12", subtitle: "Iconic, Always.", price: 800 },
];

export function getProductById(id) {
    return PRODUCTS.find((p) => p.id === id);
}