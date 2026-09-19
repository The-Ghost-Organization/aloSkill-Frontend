import { Download, X } from "lucide-react";
import type { MouseEvent } from "react";
import { orderItemType, orderStatusLabel, type StudentOrder } from "../types";
import { fmt, fmtDateTime } from "../utils";

type Props = {
  order: StudentOrder;
  onClose: () => void;
  onDownload: () => void;
};

export default function InvoiceModal({ order, onClose, onDownload }: Props) {
  const subtotal = Number(order.totalAmount) - Number(order.shippingCost || 0);
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div role='dialog' aria-modal='true' aria-labelledby='invoice-title' onClick={handleBackdropClick} className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl'>
        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4'>
          <div><h2 id='invoice-title' className='font-bold text-gray-900'>Invoice</h2><p className='mt-0.5 break-all text-xs text-gray-400'>#{order.id}</p></div>
          <div className='flex gap-2'>
            <button type='button' onClick={onDownload} className='inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600'><Download className='h-4 w-4' /> Print / Save PDF</button>
            <button type='button' onClick={onClose} aria-label='Close invoice' className='rounded-lg p-2 text-gray-400 hover:bg-gray-100'><X className='h-4 w-4' /></button>
          </div>
        </div>

        <div className='space-y-6 p-5 sm:p-7'>
          <div className='flex items-start justify-between gap-4 border-b-2 border-orange-200 pb-5'>
            <div><p className='text-xl font-black text-orange-600'>AloSkill</p><p className='text-xs text-gray-500'>Learn, grow, and build your future.</p></div>
            <div className='text-right text-xs text-gray-500'><p className='font-semibold text-gray-900'>{orderStatusLabel[order.status]}</p><p className='mt-1'>{fmtDateTime(order.createdAt)}</p><p className='mt-1'>{order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"}</p></div>
          </div>

          {order.shippingAddress && (
            <div className='rounded-xl bg-gray-50 p-4 text-sm text-gray-600'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-gray-400'>Billed / delivered to</p>
              <p className='font-semibold text-gray-900'>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          )}

          <div className='overflow-hidden rounded-xl border border-gray-100'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-orange-500 text-xs text-white'><tr><th className='px-4 py-3'>Item</th><th className='px-4 py-3'>Type</th><th className='px-4 py-3 text-center'>Qty</th><th className='px-4 py-3 text-right'>Amount</th></tr></thead>
              <tbody className='divide-y divide-gray-100'>
                {order.orderItems.map(item => (
                  <tr key={item.id}><td className='px-4 py-3 font-medium text-gray-900'>{item.book?.title ?? item.course?.title ?? "Order item"}</td><td className='px-4 py-3 text-gray-500'>{orderItemType(item)}</td><td className='px-4 py-3 text-center text-gray-600'>{item.quantity}</td><td className='px-4 py-3 text-right font-semibold'>৳ {(Number(item.price) * item.quantity).toLocaleString("en-BD")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className='ml-auto w-full max-w-xs space-y-2 text-sm'>
            <div className='flex justify-between text-gray-600'><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
            <div className='flex justify-between text-gray-600'><dt>Shipping</dt><dd>{fmt(Number(order.shippingCost || 0))}</dd></div>
            <div className='flex justify-between border-t-2 border-gray-800 pt-3 text-base font-bold'><dt>Total</dt><dd className='text-orange-600'>{fmt(Number(order.totalAmount))}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
