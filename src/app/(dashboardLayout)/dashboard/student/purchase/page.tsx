"use client";

import ComingSoon from "@/components/shared/ComingSoon";
import { Download } from "lucide-react";

// This is a placeholder structure. Once you have your Prisma 'Order' model,
// you can fetch and map it here.
const hasData = false;

export default function PurchaseHistory() {
  if (!hasData) return <ComingSoon pageName='Invoices & Purchase History' />;

  return (
    <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
      <div className='px-6 py-4 border-b border-gray-100 bg-gray-50/50'>
        <h2 className='font-bold text-gray-900'>Transaction History</h2>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='text-sm text-gray-500 border-b border-gray-100'>
              <th className='px-6 py-4 font-medium'>Course</th>
              <th className='px-6 py-4 font-medium'>Date</th>
              <th className='px-6 py-4 font-medium'>Amount</th>
              <th className='px-6 py-4 font-medium text-right'>Invoice</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {/* Map your orders here */}
            <tr className='hover:bg-gray-50 transition-colors'>
              <td className='px-6 py-4 font-medium text-gray-900'>Next.js Mastery</td>
              <td className='px-6 py-4 text-sm text-gray-600'>Oct 24, 2025</td>
              <td className='px-6 py-4 text-sm font-semibold text-gray-900'>৳ 2,500</td>
              <td className='px-6 py-4 text-right'>
                <button className='inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm'>
                  <Download className='w-4 h-4' /> PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
