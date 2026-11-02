import {
  bookDraftStorage,
  productDraftStorage,
  checkoutDataStorage,
  courseDraftStorage,
} from "@/lib/storage/courseDraftStorage";

const requestKeys = new Map<string, { signature: string; id: string }>();

/** Keep one key across connection retries/reloads for the same reviewed checkout. */
export function checkoutRequestKey(userId: string, selection: unknown): string {
  const signature = JSON.stringify(selection);
  const storageKey = `aloskill:checkout-request:${userId}`;
  const memory = requestKeys.get(userId);
  if (memory?.signature === signature) return memory.id;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null") as {
      signature: string;
      id: string;
    } | null;
    if (saved?.signature === signature && saved.id) {
      requestKeys.set(userId, saved);
      return saved.id;
    }
  } catch {
    /* A new key can still be used when a stored value is invalid. */
  }
  const id = crypto.randomUUID();
  requestKeys.set(userId, { signature, id });
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ signature, id }));
  } catch {
    /* Storage can be disabled. */
  }
  return id;
}

/** Remove only purchased cart lines; a direct purchase must not empty unrelated items. */
export function rememberCheckoutOrder(orderId: string) {
  try {
    sessionStorage.setItem(`aloskill:checkout-order:${orderId}`, "pending");
  } catch {
    /* Storage is optional. */
  }
}

export function resetCheckoutRequest(userId: string) {
  requestKeys.delete(userId);
  try {
    sessionStorage.removeItem(`aloskill:checkout-request:${userId}`);
  } catch {
    /* Storage is optional. */
  }
}

export function clearPurchasedCartItems(
  items: {
    course?: { id?: string } | null;
    book?: { id?: string } | null;
    product?: { id?: string } | null;
    format: string;
    quantity: number;
  }[],
  orderId: string,
) {
  // Viewing an old order must not remove items added for a new purchase.
  const marker = `aloskill:checkout-order:${orderId}`;
  try {
    if (sessionStorage.getItem(marker) !== "pending") return;
  } catch {
    return;
  }
  const courses = new Set(items.flatMap((item) => (item.course?.id ? [item.course.id] : [])));
  const books = new Map<string, number>(
    items.flatMap((item) =>
      item.book?.id
        ? [
            [
              `${item.book.id}:${item.format === "PHYSICAL" ? "PHYSICAL" : "EBOOK"}`,
              item.quantity,
            ] as const,
          ]
        : [],
    ),
  );
  courseDraftStorage.save(
    (courseDraftStorage.get<{ courseId: string; quantity: number }[]>() ?? []).filter(
      (item) => !courses.has(item.courseId),
    ),
  );
  bookDraftStorage.save(
    (bookDraftStorage.get<{ bookId: string; format: string; quantity: number }[]>() ?? [])
      .map((item) => ({
        ...item,
        quantity: Math.max(0, item.quantity - (books.get(`${item.bookId}:${item.format}`) ?? 0)),
      }))
      .filter((item) => item.quantity > 0),
  );
  const products = new Map(
    items.flatMap((item) => (item.product?.id ? [[item.product.id, item.quantity] as const] : [])),
  );
  productDraftStorage.save(
    (productDraftStorage.get<{ productId: string; quantity: number }[]>() || [])
      .map((row) => ({
        ...row,
        quantity: Math.max(0, row.quantity - (products.get(row.productId) || 0)),
      }))
      .filter((row) => row.quantity > 0),
  );
  checkoutDataStorage.clear();
  try {
    sessionStorage.setItem(marker, "cleared");
  } catch {
    /* Best effort. */
  }
}

export type CheckoutQuote = {
  subtotal: number;
  shippingCost: number;
  total: number;
  totalWeight: number;
  paymentRequired: boolean;
  needsShipping: boolean;
  items: {
    courseId?: string;
    bookId?: string;
    productId?: string;
    title: string;
    format: "PHYSICAL" | "DIGITAL";
    price: string;
    quantity: number;
  }[];
};
