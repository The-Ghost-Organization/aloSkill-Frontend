import ProductDetails from "@/components/products/ProductDetails";
import type { Product } from "@/components/products/product.types";
import { productImages } from "@/components/products/product.utils";
import { apiClient } from "@/lib/api/client";
import type { Metadata } from "next";
import { cache } from "react";

type Params = Promise<{ id: string }>;

/**
 * Server fetch, deduplicated between generateMetadata and the page.
 * Returns null on any failure — the client component then retries and
 * renders a friendly "unavailable" state instead of a hard error.
 */
const getProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    const res = await apiClient.get<Product>(`/product/public/${encodeURIComponent(id)}`);
    return res.success && res.data ? res.data : null;
  } catch {
    return null;
  }
});

const summarize = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product", robots: { index: false } };

  const description =
    summarize(product.description || "") || `${product.title} — sold and shipped by Aloskill.`;
  const image = productImages(product)[0];
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
    },
  };
}

/** schema.org Product JSON-LD. `<` is escaped so user text can't close the script tag. */
function ProductJsonLd({ product }: { product: Product }) {
  const price = product.approvedPrice === null ? null : Number(product.approvedPrice);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: summarize(product.description || "", 500),
    image: productImages(product),
    category: product.category,
    sku: product.id,
    brand: { "@type": "Brand", name: "Aloskill" },
    ...(price !== null && Number.isFinite(price)
      ? {
          offers: {
            "@type": "Offer",
            url: `https://aloskill.com/products/${product.id}`,
            priceCurrency: "BDT",
            price: price.toFixed(2),
            availability:
              product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "Aloskill" },
          },
        }
      : {}),
  };
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return (
    <>
      {product && <ProductJsonLd product={product} />}
      <ProductDetails
        id={id}
        initialProduct={product}
      />
    </>
  );
}
