"use client";

import { useCallback, useMemo, useState } from "react";
import InvoiceModal from "./components/InvoiceModal.tsx";
import PurchaseControls from "./components/PurchaseControls.tsx";
import PurchaseMobileCards from "./components/PurchaseMobileCards.tsx";
import PurchasePagination from "./components/PurchasePagination.tsx";
import PurchaseTable from "./components/PurchaseTable.tsx";
import SummaryCards from "./components/SummaryCards";
import { ITEMS_PER_PAGE } from "./config.ts";
import { openInvoiceForPrint } from "./invoice-generator.ts";
import { mockPurchases } from "./mock-data.ts";
import type { Purchase, SortOrder } from "./types";

export default function PurchaseHistory() {
  // ── Filter / sort state ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);

  // Stable helper – avoids duplicating `setCurrentPage(1)` in every handler
  const resetPage = useCallback(() => setCurrentPage(1), []);

  // ── Derived: summary stats ───────────────────────────────────────────────
  // Empty dep array is intentional – mockPurchases is a module-level constant.
  // Replace with `[purchases]` once you wire up real data.
  const stats = useMemo(() => {
    const completed = mockPurchases.filter(p => p.paymentStatus === "COMPLETED");
    return {
      totalOrders: mockPurchases.length,
      totalSpent: completed.reduce((s, p) => s + p.finalAmount, 0),
      totalSaved: completed.reduce((s, p) => s + p.discountAmount, 0),
    };
  }, []);

  // ── Derived: filtered + sorted list ─────────────────────────────────────
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...mockPurchases]
      .filter(p => {
        if (
          q &&
          !p.productTitle.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q) &&
          !p.transactionId.toLowerCase().includes(q)
        )
          return false;
        if (typeFilter !== "ALL" && p.productType !== typeFilter) return false;
        if (statusFilter !== "ALL" && p.paymentStatus !== statusFilter) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
          : new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
      );
  }, [search, typeFilter, statusFilter, sortOrder]);

  // ── Derived: pagination ──────────────────────────────────────────────────
  const { totalPages, paginated } = useMemo(
    () => ({
      totalPages: Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE)),
      paginated: processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    }),
    [processed, currentPage]
  );

  // ── Stable callbacks – safe to pass to memo'd children ──────────────────
  const handleSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      resetPage();
    },
    [resetPage]
  );
  const handleTypeFilter = useCallback(
    (v: string) => {
      setTypeFilter(v);
      resetPage();
    },
    [resetPage]
  );
  const handleStatusFilter = useCallback(
    (v: string) => {
      setStatusFilter(v);
      resetPage();
    },
    [resetPage]
  );
  const handleSortChange = useCallback(
    (v: SortOrder) => {
      setSortOrder(v);
      resetPage();
    },
    [resetPage]
  );
  const handleViewInvoice = useCallback((purchase: Purchase) => setSelectedInvoice(purchase), []);
  const handleCloseInvoice = useCallback(() => setSelectedInvoice(null), []);
  const handleDownload = useCallback((purchase: Purchase) => openInvoiceForPrint(purchase), []);
  // Dedicated callback for the modal's own download button
  const handleDownloadSelected = useCallback(() => {
    if (selectedInvoice) openInvoiceForPrint(selectedInvoice);
  }, [selectedInvoice]);

  return (
    <>
      {selectedInvoice && (
        <InvoiceModal
          purchase={selectedInvoice}
          onClose={handleCloseInvoice}
          onDownload={handleDownloadSelected}
        />
      )}

      <div className='space-y-5'>
        <SummaryCards stats={stats} />

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Section header */}
          <div className='px-5 py-4 border-b border-gray-100 bg-gray-50/60'>
            <h2 className='font-bold text-gray-900'>Transaction History</h2>
          </div>

          <PurchaseControls
            search={search}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            sortOrder={sortOrder}
            onSearchChange={handleSearchChange}
            onTypeFilterChange={handleTypeFilter}
            onStatusFilterChange={handleStatusFilter}
            onSortChange={handleSortChange}
          />

          {/* Desktop table / mobile cards share the same paginated slice */}
          <PurchaseTable
            purchases={paginated}
            onViewInvoice={handleViewInvoice}
            onDownload={handleDownload}
          />
          <PurchaseMobileCards
            purchases={paginated}
            onViewInvoice={handleViewInvoice}
            onDownload={handleDownload}
          />

          {processed.length > ITEMS_PER_PAGE && (
            <PurchasePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={processed.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </>
  );
}
