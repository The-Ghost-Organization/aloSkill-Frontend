// app/cart/page.tsx
import { ShoppingCart } from "lucide-react";
import CartManager from "./CartManager";
import Link from 'next/link';

export const metadata = {
  title: "Shopping Cart",
};

export default function ShoppingCartPage() {
  return (
    <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50'>
      {/* Breadcrumb - Static Server Side */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center gap-3'>
            <ShoppingCart className='w-5 h-5 text-[#DA7C36]' />
            <nav className='flex items-center gap-2 text-sm text-gray-600 overflow-x-auto'>
              <Link href='/' className='hover:text-orange transition-colors whitespace-nowrap'>
                Home
              </Link>
              <span className='text-gray-400'>/</span>
              <p className='text-sm text-orange font-medium'>Shopping Cart</p>
            </nav>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Pass control over to the interactive Client Manager */}
        <CartManager />
      </main>
    </div>
  );
}
