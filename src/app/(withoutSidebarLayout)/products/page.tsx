import { PRODUCTS_CATALOG_HREF } from "@/components/products/catalog";
import { permanentRedirect } from "next/navigation";

/**
 * Legacy listing URL. Products now live in the "Products" tab of the
 * Books & Resources catalog; 308 keeps bookmarks and SEO equity working.
 * Product detail pages (/products/[id]) are unaffected.
 */
export default function ProductsPage(): never {
  permanentRedirect(PRODUCTS_CATALOG_HREF);
}
