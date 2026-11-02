import ProductManager from "@/components/products/ProductManager";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const initialNotice =
    submitted === "draft"
      ? "Product draft saved."
      : submitted === "review"
        ? "Product submitted for Aloskill review."
        : "";
  return <ProductManager key={submitted || "list"} initialNotice={initialNotice} />;
}
