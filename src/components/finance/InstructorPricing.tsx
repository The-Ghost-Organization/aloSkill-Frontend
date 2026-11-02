"use client";

import { apiClient } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { productMoney } from "@/components/products/product.types";

type CatalogItem = {
  id: string;
  title: string;
  status: string;
  prices: {
    label: string;
    approvedPrice: string | null;
    commissionRate: string | null;
    commissionAmount: string | null;
    platformFeeAmount: string | null;
    expectedEarning: string | null;
  }[];
};

export default function InstructorPricing({
  type,
  revision = 0,
}: {
  type: "course" | "book" | "product";
  revision?: number;
}) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setItems(null);
    setError("");
    void apiClient
      .get<CatalogItem[]>(`/finance/instructor/catalog?type=${type}`)
      .then((response) => {
        if (!active) return;
        if (response.success && response.data) setItems(response.data);
        else setError(response.message || "Pricing could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [type, revision]);
  return (
    <section
      className='rounded-xl border border-slate-200 bg-white p-4 sm:p-5'
      aria-label='Approved pricing and earnings'
    >
      <h2 className='font-semibold text-slate-900'>Approved pricing & earnings</h2>
      <p className='mt-1 text-xs leading-5 text-slate-600'>
        Per sale at the current approved price. Discounts and refunds can change actual earnings.
        Delivery charges are excluded.
      </p>
      {error ? (
        <p role='alert' className='mt-3 text-sm text-red-700'>
          {error}
        </p>
      ) : !items ? (
        <p role='status' className='mt-3 text-sm text-slate-600'>
          Loading pricing…
        </p>
      ) : !items.length ? (
        <p className='mt-3 text-sm text-slate-600'>
          Your {type}s will appear here after submission.
        </p>
      ) : (
        <div className='mt-4 overflow-x-auto'>
          <table className='w-full min-w-[620px] text-left text-sm'>
            <thead className='border-b text-xs text-slate-500'>
              <tr>
                {[
                  "Item / format",
                  "Approved price",
                  "Aloskill commission",
                  "Platform fee",
                  "Expected earnings",
                ].map((label) => (
                  <th key={label} scope='col' className='p-2'>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {items.flatMap((item) =>
                item.prices.map((price, index) => (
                  <tr key={`${item.id}-${index}`}>
                    <td className='p-2 font-medium text-slate-800'>
                      {item.title}
                      <span className='block text-xs font-normal text-slate-500'>
                        {price.label} · {item.status}
                      </span>
                    </td>
                    <td className='p-2'>{productMoney(price.approvedPrice)}</td>
                    <td className='p-2'>
                      {price.commissionRate === null
                        ? "Awaiting approval"
                        : `${price.commissionRate}% · ${productMoney(price.commissionAmount)}`}
                    </td>
                    <td className='p-2'>
                      {price.platformFeeAmount === null
                        ? "—"
                        : productMoney(price.platformFeeAmount)}
                    </td>
                    <td className='p-2 font-semibold text-emerald-700'>
                      {price.expectedEarning === null
                        ? "Awaiting approval"
                        : productMoney(price.expectedEarning)}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
