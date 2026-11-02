"use client";

import InstructorPricing from "@/components/finance/InstructorPricing";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { productMoney, type Product, type ProductPage } from "./product.types";

const field =
  "mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-orange-500";
const button =
  "rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const empty = {
  title: "",
  description: "",
  category: "",
  proposedPrice: "",
  weight: "",
  imageUrls: [] as string[],
  relatedCourseId: "",
  relatedBookId: "",
};

function uploadedUrl(payload: unknown): string {
  const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const nested =
    obj["data"] && typeof obj["data"] === "object" ? (obj["data"] as Record<string, unknown>) : {};
  for (const value of [
    payload,
    obj["url"],
    obj["fileUrl"],
    obj["location"],
    obj["data"],
    nested["url"],
    nested["fileUrl"],
    nested["location"],
  ]) {
    if (typeof value !== "string") continue;
    try {
      const url = new URL(value.replace(/^["']|["']$/g, ""));
      if (url.protocol === "https:") return url.href;
    } catch {
      /* Try supported response shapes. */
    }
  }
  throw new Error("The upload did not return an HTTPS image URL.");
}

export default function ProductManager({
  admin = false,
  uploadMode = false,
  initialNotice = "",
}: {
  admin?: boolean;
  uploadMode?: boolean;
  initialNotice?: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(uploadMode);
  const [selected, setSelected] = useState<Product | null>(null);
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [suggestion, setSuggestion] = useState<{ rate: string; source: string } | null>(null);
  const [note, setNote] = useState("");
  const [received, setReceived] = useState("1");
  const [damaged, setDamaged] = useState("0");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (uploadMode) return;
    let active = true;
    setLoading(true);
    setError("");
    void apiClient
      .get<
        Product[] | ProductPage
      >(admin ? `/product/admin?page=${page}&pageSize=20${status ? `&status=${status}` : ""}` : "/product/instructor")
      .then(response => {
        if (!active) return;
        setLoading(false);
        if (!response.success || !response.data) {
          setError(response.message || "Products could not be loaded.");
          return;
        }
        const rows = Array.isArray(response.data) ? response.data : response.data.items;
        setProducts(rows);
        setTotal(Array.isArray(response.data) ? rows.length : response.data.total);
      });
    return () => {
      active = false;
    };
  }, [admin, uploadMode, revision, page, status]);

  useEffect(() => {
    if (admin) return;
    void Promise.all([
      apiClient.get<{ id: string; title: string; status: string }[]>(
        "/finance/instructor/catalog?type=course"
      ),
      apiClient.get<{ id: string; title: string; status: string }[]>(
        "/finance/instructor/catalog?type=book"
      ),
    ]).then(([c, b]) => {
      setCourses((c.data || []).filter(item => item.status === "PUBLISHED"));
      setBooks((b.data || []).filter(item => item.status === "APPROVED"));
    });
  }, [admin]);

  useEffect(() => {
    setSuggestion(null);
    if (!admin || !selected) return;
    let active = true;
    void apiClient
      .get<{
        rate: string;
        source: string;
      }>(`/finance/admin/products/product/${selected.id}/commission`)
      .then(response => {
        if (active && response.success && response.data) setSuggestion(response.data);
      });
    return () => {
      active = false;
    };
  }, [admin, selected?.id]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (form.imageUrls.length + files.length > 6) {
      setError("Choose up to six images.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024
        )
          throw new Error("Use JPG, PNG or WebP images up to 5 MB each.");
        const data = new FormData();
        data.append("file", file);
        const result = await apiClient.postFormData<unknown>(
          "/course/instructor-file-upload?folder=products/images",
          data
        );
        if (!result.success) throw new Error(result.message || "Image upload failed.");
        urls.push(uploadedUrl(result.data));
      }
      setForm(current => ({ ...current, imageUrls: [...current.imageUrls, ...urls] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const state = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") || "PENDING";
    const payload = {
      ...form,
      proposedPrice: Number(form.proposedPrice),
      weight: Number(form.weight),
      relatedCourseId: form.relatedCourseId || null,
      relatedBookId: form.relatedBookId || null,
      status: state,
    };
    const response = editing
      ? await apiClient.patch(`/product/instructor/${editing}`, payload)
      : await apiClient.post("/product/instructor", payload);
    setBusy(false);
    if (!response.success) {
      setError(response.message || "Product could not be saved.");
      return;
    }
    if (uploadMode) {
      router.push(
        `/dashboard/instructor/products?submitted=${state === "DRAFT" ? "draft" : "review"}`
      );
      return;
    }
    setShowForm(false);
    setEditing(null);
    setForm(empty);
    setRevision(value => value + 1);
    setNotice(state === "DRAFT" ? "Draft saved." : "Product submitted for Aloskill review.");
  }

  async function review(next: "APPROVED" | "REJECTED" | "SUSPENDED") {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    const response = await apiClient.patch(`/product/admin/${selected.id}/review`, {
      status: next,
      ...(next === "APPROVED" ? { approvedPrice: Number(price) } : {}),
      ...(commission !== "" ? { commissionRate: Number(commission) } : {}),
      reviewNote: note,
    });
    setBusy(false);
    if (!response.success) {
      setError(response.message || "Review could not be saved.");
      return;
    }
    setSelected(null);
    setRevision(value => value + 1);
    setNotice("Product review saved.");
  }

  async function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    const response = await apiClient.post(`/product/admin/${selected.id}/receipts`, {
      receivedQuantity: Number(received),
      damagedQuantity: Number(damaged),
      note,
    });
    setBusy(false);
    if (!response.success) {
      setError(response.message || "Stock receipt could not be saved.");
      return;
    }
    setSelected(null);
    setRevision(value => value + 1);
    setNotice("Stock received. Only sellable units were added to inventory.");
  }

  return (
    <div className={`space-y-5 ${admin ? "text-slate-200" : "text-slate-800"}`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold'>
            {admin ? "Products & inventory" : uploadMode ? "Upload Product" : "My Products"}
          </h1>
          <p className='mt-1 max-w-2xl text-sm text-slate-500'>
            {admin
              ? "Confirm selling prices, review submissions and receive instructor stock. Aloskill ships every order."
              : "Submit your finished products. Aloskill confirms the price, receives your stock and ships customer orders."}
          </p>
        </div>
        {!admin &&
          (uploadMode ? (
            <Link
              href='/dashboard/instructor/products'
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold'
            >
              ← Back to My Products
            </Link>
          ) : (
            <Link
              href='/dashboard/instructor/products/upload-products'
              className={button}
            >
              Upload Product
            </Link>
          ))}
      </div>
      {error && (
        <p
          role='alert'
          className='rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800'
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role='status'
          className='rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800'
        >
          {notice}
        </p>
      )}
      {!admin && showForm && (
        <form
          onSubmit={submit}
          className='space-y-4 rounded-xl border border-slate-200 bg-white p-5'
        >
          <h2 className='text-lg font-semibold'>{editing ? "Edit product" : "Add product"}</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='text-sm'>
              Product name
              <input
                className={field}
                required
                maxLength={160}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className='text-sm'>
              Category
              <input
                className={field}
                required
                maxLength={80}
                placeholder='Stationery, course kit, learning tool…'
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label className='text-sm'>
              Proposed selling price (BDT)
              <input
                className={field}
                required
                type='number'
                min='0.01'
                step='0.01'
                value={form.proposedPrice}
                onChange={e => setForm({ ...form, proposedPrice: e.target.value })}
              />
            </label>
            <label className='text-sm'>
              Weight per unit (grams)
              <input
                className={field}
                required
                type='number'
                min='1'
                step='1'
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
              />
            </label>
            <label className='text-sm sm:col-span-2'>
              Description
              <textarea
                className={field}
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className='text-sm'>
              Related course (optional)
              <select
                className={field}
                value={form.relatedCourseId}
                onChange={e => setForm({ ...form, relatedCourseId: e.target.value })}
              >
                <option value=''>No related course</option>
                {courses.map(item => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label className='text-sm'>
              Related book (optional)
              <select
                className={field}
                value={form.relatedBookId}
                onChange={e => setForm({ ...form, relatedBookId: e.target.value })}
              >
                <option value=''>No related book</option>
                {books.map(item => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className='block text-sm'>
            Product photos (1–6, up to 5 MB each)
            <input
              className={field}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              multiple
              disabled={busy}
              onChange={e => {
                void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <div className='flex flex-wrap gap-3'>
            {form.imageUrls.map((url, i) => (
              <div
                key={url}
                className='relative'
              >
                <img
                  src={url}
                  alt={`Product photo ${i + 1}`}
                  className='h-20 w-20 rounded-lg object-cover'
                />
                <button
                  type='button'
                  aria-label={`Remove photo ${i + 1}`}
                  className='absolute right-0 top-0 bg-white px-1 text-red-700'
                  onClick={() =>
                    setForm({
                      ...form,
                      imageUrls: form.imageUrls.filter((_, index) => index !== i),
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className='text-xs text-slate-600'>
            Stock is recorded by Aloskill after your finished items arrive. Drafts and rejected
            submissions can be edited.
          </p>
          <div className='flex flex-wrap gap-2'>
            <button
              className={button}
              disabled={busy || !form.imageUrls.length}
              type='submit'
              value='PENDING'
            >
              {busy ? "Saving…" : "Submit for approval"}
            </button>
            <button
              className='rounded-lg border px-4 py-2 text-sm'
              disabled={busy || !form.imageUrls.length}
              type='submit'
              value='DRAFT'
            >
              Save draft
            </button>
            {uploadMode ? (
              <Link
                href='/dashboard/instructor/products'
                className='px-3 py-2 text-sm'
              >
                Cancel
              </Link>
            ) : (
              <button
                className='px-3 py-2 text-sm'
                type='button'
                disabled={busy}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {admin && (
        <label className='block max-w-xs text-sm'>
          Status
          <select
            className={field}
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value=''>All statuses</option>
            {["DRAFT", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map(value => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      )}
      {!uploadMode &&
        (loading ? (
          <p role='status'>Loading products…</p>
        ) : (
          <div
            className={`overflow-x-auto rounded-xl border ${admin ? "border-slate-800" : "border-slate-200 bg-white"}`}
          >
            <table className='w-full min-w-[700px] text-left text-sm'>
              <thead className='border-b border-slate-300/30 text-xs uppercase text-slate-500'>
                <tr>
                  {[
                    "Product",
                    "Proposed price",
                    "Approved price",
                    "Stock at Aloskill",
                    "Status",
                    "Action",
                  ].map(name => (
                    <th
                      className='p-3'
                      scope='col'
                      key={name}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr
                    key={product.id}
                    className='border-b border-slate-300/20'
                  >
                    <td className='p-3'>
                      <p className='font-semibold'>{product.title}</p>
                      <p className='text-xs text-slate-500'>
                        {admin
                          ? product.owner?.instructorProfile?.displayName || product.owner?.email
                          : product.category}
                      </p>
                      {product.reviewNote && (
                        <p className='mt-1 max-w-xs text-xs text-amber-600'>{product.reviewNote}</p>
                      )}
                    </td>
                    <td className='p-3'>{productMoney(product.proposedPrice)}</td>
                    <td className='p-3'>{productMoney(product.approvedPrice)}</td>
                    <td className='p-3'>{product.stock}</td>
                    <td className='p-3'>{product.status}</td>
                    <td className='p-3'>
                      {admin ? (
                        <button
                          className='font-semibold text-orange-500'
                          onClick={() => {
                            setSelected(product);
                            setPrice(String(product.approvedPrice ?? product.proposedPrice));
                            setCommission(product.commissionRate || "");
                            setNote("");
                            setReceived("1");
                            setDamaged("0");
                          }}
                        >
                          Review / receive
                        </button>
                      ) : ["DRAFT", "REJECTED"].includes(product.status) ? (
                        <button
                          className='font-semibold text-orange-600'
                          onClick={() => {
                            setEditing(product.id);
                            setForm({
                              title: product.title,
                              category: product.category,
                              description: product.description,
                              proposedPrice: String(product.proposedPrice),
                              weight: String(product.weight),
                              imageUrls: product.imageUrls,
                              relatedBookId: product.relatedBookId || "",
                              relatedCourseId: product.relatedCourseId || "",
                            });
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>
                      ) : (
                        <span className='text-xs text-slate-500'>Managed by Aloskill</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products.length && (
              <p className='p-8 text-center text-sm text-slate-500'>No products found.</p>
            )}
          </div>
        ))}
      {admin && total > 20 && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
            className='rounded border px-3 py-1 disabled:opacity-50'
          >
            Previous
          </button>
          <span className='text-sm'>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            type='button'
            disabled={page * 20 >= total || loading}
            onClick={() => setPage(page + 1)}
            className='rounded border px-3 py-1 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
      {admin && selected && (
        <section className='space-y-4 rounded-xl border border-slate-700 p-5'>
          <div className='flex justify-between gap-3'>
            <h2 className='text-lg font-semibold'>{selected.title}</h2>
            <button
              type='button'
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
          <p className='whitespace-pre-line text-sm'>{selected.description}</p>
          <div className='flex gap-3 overflow-x-auto'>
            {selected.imageUrls.map(url => (
              <img
                key={url}
                src={url}
                alt={selected.title}
                className='h-24 w-24 rounded object-cover'
              />
            ))}
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <label className='text-sm'>
              Final selling price (BDT)
              <input
                className={field}
                type='number'
                min='0.01'
                step='0.01'
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </label>
            <label className='text-sm'>
              Aloskill commission (%)
              <input
                className={field}
                placeholder={
                  suggestion
                    ? `${suggestion.rate}% (${suggestion.source.toLowerCase()})`
                    : "Use instructor / global rate"
                }
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={commission}
                onChange={e => setCommission(e.target.value)}
              />
            </label>
          </div>
          {suggestion && (
            <p className='text-xs text-slate-400'>
              Effective commission: {commission || suggestion.rate}% (
              {commission ? "custom rate" : suggestion.source.toLowerCase()}). Leave blank to keep
              the effective rate shown.
            </p>
          )}
          <label className='block text-sm'>
            Review / receiving note
            <textarea
              className={field}
              maxLength={1000}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </label>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              className={button}
              disabled={busy || !price || Number(price) <= 0}
              onClick={() => void review("APPROVED")}
            >
              Approve & confirm price
            </button>
            <button
              type='button'
              disabled={busy}
              className='rounded border px-3 py-2 text-sm'
              onClick={() => void review("REJECTED")}
            >
              Reject
            </button>
            <button
              type='button'
              disabled={busy}
              className='rounded border px-3 py-2 text-sm'
              onClick={() => void review("SUSPENDED")}
            >
              Suspend sales
            </button>
          </div>
          <form
            onSubmit={receive}
            className='space-y-3 border-t border-slate-700 pt-4'
          >
            <h3 className='font-semibold'>Receive finished stock</h3>
            {!["APPROVED", "SUSPENDED"].includes(selected.status) && (
              <p className='text-sm text-amber-400'>
                Approve this product before recording received stock.
              </p>
            )}
            <p className='text-xs text-slate-400'>
              Count all received items, including damaged units. Only received minus damaged will be
              added to sellable stock.
            </p>
            <div className='grid gap-3 sm:grid-cols-2'>
              <label className='text-sm'>
                Total received
                <input
                  required
                  className={field}
                  type='number'
                  min='1'
                  step='1'
                  value={received}
                  onChange={e => setReceived(e.target.value)}
                />
              </label>
              <label className='text-sm'>
                Damaged units
                <input
                  required
                  className={field}
                  type='number'
                  min='0'
                  max={received}
                  step='1'
                  value={damaged}
                  onChange={e => setDamaged(e.target.value)}
                />
              </label>
            </div>
            <button
              disabled={busy || !["APPROVED", "SUSPENDED"].includes(selected.status)}
              className={button}
            >
              Record receipt
            </button>
          </form>
          {!!selected.receipts?.length && (
            <div className='space-y-2 text-xs'>
              <h3 className='font-semibold'>Recent receipts</h3>
              {selected.receipts.map(receipt => (
                <p key={receipt.id}>
                  {new Date(receipt.createdAt).toLocaleDateString("en-BD")} · Received{" "}
                  {receipt.receivedQuantity}, damaged {receipt.damagedQuantity}
                  {receipt.note && ` · ${receipt.note}`}
                </p>
              ))}
            </div>
          )}
        </section>
      )}
      {!admin && !uploadMode && (
        <InstructorPricing
          type='product'
          revision={revision}
        />
      )}
    </div>
  );
}
