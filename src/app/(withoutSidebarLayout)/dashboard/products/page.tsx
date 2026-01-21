// // app/admin/products/page.tsx
// "use client";
// import type { Book } from "@/types/book";
// import { motion } from "framer-motion";
// import { CheckCircle, XCircle } from "lucide-react";
// import { useState } from "react";
// import AdminProductForm from "./ProductForm.tsx";

// /**
//  * Admin Products Management Page
//  *
//  * Features:
//  * - Add new products
//  * - Form validation
//  * - Success/Error notifications
//  * - Redirect after successful submission
//  */
// export default function AdminProductsPage() {
//   const [notification, setNotification] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);

//   /**
//    * Handle product submission
//    * This would connect to your API in production
//    */
//   const handleSubmitProduct = async (product: Partial<Book>) => {
//     try {
//       // TODO: Replace with actual API call
//       // Example:
//       // const response = await fetch('/api/products', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(product),
//       // });

//       // if (!response.ok) throw new Error('Failed to create product');

//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       console.log("Product submitted:", product);

//       // Show success notification
//       setNotification({
//         type: "success",
//         message: "Product created successfully!",
//       });

//       // Auto-hide notification after 5 seconds
//       setTimeout(() => {
//         setNotification(null);
//       }, 5000);

//       // Optional: Redirect to products list after 2 seconds
//       // setTimeout(() => {
//       //   window.location.href = '/admin/products/list';
//       // }, 2000);
//     } catch (error) {
//       console.error("Error submitting product:", error);

//       // Show error notification
//       setNotification({
//         type: "error",
//         message: "Failed to create product. Please try again.",
//       });

//       // Auto-hide notification after 5 seconds
//       setTimeout(() => {
//         setNotification(null);
//       }, 5000);
//     }
//   };

//   /**
//    * Handle cancel action
//    */
//   const handleCancel = () => {
//     if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
//       window.location.href = "/admin";
//     }
//   };

//   return (
//     <div className='relative'>
//       {/* Notification Toast */}
//       {notification && (
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -50 }}
//           className='fixed top-4 right-4 z-50 max-w-md'
//         >
//           <div
//             className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
//               notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
//             }`}
//           >
//             {notification.type === "success" ? (
//               <CheckCircle className='w-6 h-6 flex-shrink-0' />
//             ) : (
//               <XCircle className='w-6 h-6 flex-shrink-0' />
//             )}
//             <p className='font-semibold'>{notification.message}</p>
//             <button
//               onClick={() => setNotification(null)}
//               className='ml-auto text-white hover:text-gray-200'
//             >
//               ✕
//             </button>
//           </div>
//         </motion.div>
//       )}

//       {/* Main Form */}
//       <AdminProductForm
//         onSubmit={handleSubmitProduct}
//         onCancel={handleCancel}
//       />
//     </div>
//   );
// }
