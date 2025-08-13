// app/bouquet/[id]/page.jsx
import { getProductById } from "@/lib/products";
import BouquetDetailClient from "@/components/bouquet/BouquetDetailClient";

export default async function BouquetDetailPage({ params }) {
    const { id } = await params;
    const product = getProductById(id);

    return <BouquetDetailClient product={product} />;
}