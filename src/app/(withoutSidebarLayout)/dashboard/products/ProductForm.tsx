// "use client";

// import { type Book } from "@/types/book";
// import { motion } from "framer-motion";
// import { AlertCircle, Eye, Image as ImageIcon, Loader2, Plus, Save, Upload, X } from "lucide-react";
// import React, { useState } from "react";

// /**
//  * Admin Product Upload Form Component
//  *
//  * Features:
//  * - Complete product information input
//  * - Multiple image upload with preview
//  * - Dynamic features and specifications management
//  * - Form validation
//  * - Preview mode
//  * - Draft saving
//  *
//  * @example
//  * ```tsx
//  * <AdminProductForm onSubmit={handleSubmit} />
//  * ```
//  */

// interface AdminProductFormProps {
//   existingProduct?: Book;
//   onSubmit: (product: Partial<Book>) => Promise<void>;
//   onCancel?: () => void;
// }

// const AdminProductForm: React.FC<AdminProductFormProps> = ({
//   existingProduct,
//   onSubmit,
//   onCancel,
// }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Form state
//   const [formData, setFormData] = useState<Partial<Book>>({
//     title: existingProduct?.title || "",
//     author: existingProduct?.author || "",
//     price: existingProduct?.price || 0,
//     originalPrice: existingProduct?.originalPrice || 0,
//     discount: existingProduct?.discount || 0,
//     category: existingProduct?.category || "",
//     brand: existingProduct?.brand || "",
//     sku: existingProduct?.sku || "",
//     availability: existingProduct?.availability || "In Stock",
//     rating: existingProduct?.rating || 5,
//     reviews: existingProduct?.reviews || 0,
//     description: existingProduct?.description || "",
//     features: existingProduct?.features || [""],
//     specifications: existingProduct?.specifications || {},
//   });

//   const [images, setImages] = useState<string[]>(existingProduct?.images || [""]);
//   const [newSpecKey, setNewSpecKey] = useState("");
//   const [newSpecValue, setNewSpecValue] = useState("");

//   // Handle input changes
//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: "" }));
//     }
//   };

//   // Handle number inputs
//   const handleNumberChange = (name: string, value: string) => {
//     const numValue = parseFloat(value) || 0;
//     setFormData(prev => ({ ...prev, [name]: numValue }));

//     // Auto-calculate discount
//     if (name === "price" || name === "originalPrice") {
//       const price = name === "price" ? numValue : formData.price || 0;
//       const originalPrice = name === "originalPrice" ? numValue : formData.originalPrice || 0;

//       if (originalPrice > 0 && price > 0) {
//         const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
//         setFormData(prev => ({ ...prev, discount: discountPercent }));
//       }
//     }
//   };

//   // Handle image URL changes
//   const handleImageChange = (index: number, value: string) => {
//     const newImages = [...images];
//     newImages[index] = value;
//     setImages(newImages);
//   };

//   const addImageField = () => {
//     setImages([...images, ""]);
//   };

//   const removeImageField = (index: number) => {
//     if (images.length > 1) {
//       setImages(images.filter((_, i) => i !== index));
//     }
//   };

//   // Handle features
//   const handleFeatureChange = (index: number, value: string) => {
//     const newFeatures = [...(formData.features || [""])];
//     newFeatures[index] = value;
//     setFormData(prev => ({ ...prev, features: newFeatures }));
//   };

//   const addFeature = () => {
//     setFormData(prev => ({
//       ...prev,
//       features: [...(prev.features || []), ""],
//     }));
//   };

//   const removeFeature = (index: number) => {
//     const features = formData.features || [];
//     if (features.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         features: features.filter((_, i) => i !== index),
//       }));
//     }
//   };

//   // Handle specifications
//   const addSpecification = () => {
//     if (newSpecKey && newSpecValue) {
//       setFormData(prev => ({
//         ...prev,
//         specifications: {
//           ...(prev.specifications || {}),
//           [newSpecKey]: newSpecValue,
//         },
//       }));
//       setNewSpecKey("");
//       setNewSpecValue("");
//     }
//   };

//   const removeSpecification = (key: string) => {
//     const specs = { ...(formData.specifications || {}) };
//     delete specs[key];
//     setFormData(prev => ({ ...prev, specifications: specs }));
//   };

//   // Form validation
//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.title?.trim()) newErrors.title = "Title is required";
//     if (!formData.author?.trim()) newErrors.author = "Author is required";
//     if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
//     if (!formData.category?.trim()) newErrors.category = "Category is required";
//     if (!formData.sku?.trim()) newErrors.sku = "SKU is required";
//     if (!images[0]?.trim()) newErrors.image = "At least one image URL is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const productData = {
//         ...formData,
//         image: images[0],
//         images: images.filter(img => img.trim()),
//         features: formData.features?.filter(f => f.trim()),
//       };

//       await onSubmit(productData);
//     } catch (error) {
//       console.error("Failed to submit product:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8'>
//       <div className='max-w-6xl mx-auto px-4'>
//         {/* Header */}
//         <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
//           <div className='flex items-center justify-between'>
//             <div>
//               <h1 className='text-3xl font-bold text-[var(--color-text-dark)]'>
//                 {existingProduct ? "Edit Product" : "Add New Product"}
//               </h1>
//               <p className='text-gray-600 mt-1'>
//                 Fill in the details below to {existingProduct ? "update" : "add"} a product
//               </p>
//             </div>
//             <div className='flex gap-3'>
//               <button
//                 type='button'
//                 onClick={() => setShowPreview(!showPreview)}
//                 className='flex items-center gap-2 px-4 py-2 border-2 border-[var(--color-orange)] text-[var(--color-orange)] rounded-lg hover:bg-orange-50 transition-colors'
//               >
//                 <Eye className='w-5 h-5' />
//                 {showPreview ? "Hide" : "Show"} Preview
//               </button>
//             </div>
//           </div>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className='space-y-6'
//         >
//           {/* Basic Information */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <h2 className='text-2xl font-bold text-[var(--color-text-dark)] mb-6 flex items-center gap-2'>
//               <Upload className='w-6 h-6 text-[var(--color-orange)]' />
//               Basic Information
//             </h2>

//             <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//               {/* Title */}
//               <div className='md:col-span-2'>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Book Title <span className='text-red-500'>*</span>
//                 </label>
//                 <input
//                   type='text'
//                   name='title'
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                     errors.title
//                       ? "border-red-500 focus:border-red-500"
//                       : "border-gray-200 focus:border-[var(--color-orange)]"
//                   }`}
//                   placeholder='Enter book title'
//                 />
//                 {errors.title && (
//                   <p className='mt-1 text-sm text-red-500 flex items-center gap-1'>
//                     <AlertCircle className='w-4 h-4' />
//                     {errors.title}
//                   </p>
//                 )}
//               </div>

//               {/* Author */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Author Name <span className='text-red-500'>*</span>
//                 </label>
//                 <input
//                   type='text'
//                   name='author'
//                   value={formData.author}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                     errors.author
//                       ? "border-red-500 focus:border-red-500"
//                       : "border-gray-200 focus:border-[var(--color-orange)]"
//                   }`}
//                   placeholder='Enter author name'
//                 />
//                 {errors.author && (
//                   <p className='mt-1 text-sm text-red-500 flex items-center gap-1'>
//                     <AlertCircle className='w-4 h-4' />
//                     {errors.author}
//                   </p>
//                 )}
//               </div>

//               {/* Category */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Category <span className='text-red-500'>*</span>
//                 </label>
//                 <input
//                   type='text'
//                   name='category'
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                     errors.category
//                       ? "border-red-500 focus:border-red-500"
//                       : "border-gray-200 focus:border-[var(--color-orange)]"
//                   }`}
//                   placeholder='e.g., Fiction, Self-Help, Thriller'
//                 />
//                 {errors.category && (
//                   <p className='mt-1 text-sm text-red-500 flex items-center gap-1'>
//                     <AlertCircle className='w-4 h-4' />
//                     {errors.category}
//                   </p>
//                 )}
//               </div>

//               {/* Brand */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Brand/Publisher
//                 </label>
//                 <input
//                   type='text'
//                   name='brand'
//                   value={formData.brand}
//                   onChange={handleInputChange}
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                   placeholder='e.g., Penguin Books'
//                 />
//               </div>

//               {/* SKU */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   SKU <span className='text-red-500'>*</span>
//                 </label>
//                 <input
//                   type='text'
//                   name='sku'
//                   value={formData.sku}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                     errors.sku
//                       ? "border-red-500 focus:border-red-500"
//                       : "border-gray-200 focus:border-[var(--color-orange)]"
//                   }`}
//                   placeholder='e.g., BK001234'
//                 />
//                 {errors.sku && (
//                   <p className='mt-1 text-sm text-red-500 flex items-center gap-1'>
//                     <AlertCircle className='w-4 h-4' />
//                     {errors.sku}
//                   </p>
//                 )}
//               </div>

//               {/* Availability */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Availability
//                 </label>
//                 <select
//                   name='availability'
//                   value={formData.availability}
//                   onChange={handleInputChange}
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors cursor-pointer'
//                 >
//                   <option value='In Stock'>In Stock</option>
//                   <option value='Out of Stock'>Out of Stock</option>
//                   <option value='Pre-order'>Pre-order</option>
//                 </select>
//               </div>

//               {/* Rating */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Rating (1-5)
//                 </label>
//                 <input
//                   type='number'
//                   name='rating'
//                   min='1'
//                   max='5'
//                   step='0.1'
//                   value={formData.rating}
//                   onChange={handleInputChange}
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                 />
//               </div>

//               {/* Reviews Count */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Number of Reviews
//                 </label>
//                 <input
//                   type='number'
//                   name='reviews'
//                   min='0'
//                   value={formData.reviews}
//                   onChange={handleInputChange}
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                 />
//               </div>
//             </div>
//           </motion.div>

//           {/* Pricing */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <h2 className='text-2xl font-bold text-[var(--color-text-dark)] mb-6'>
//               Pricing Information
//             </h2>

//             <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//               {/* Original Price */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Original Price (৳)
//                 </label>
//                 <input
//                   type='number'
//                   step='0.01'
//                   min='0'
//                   value={formData.originalPrice || ""}
//                   onChange={e => handleNumberChange("originalPrice", e.target.value)}
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                   placeholder='0.00'
//                 />
//                 <p className='mt-1 text-xs text-gray-500'>Optional - for showing discounts</p>
//               </div>

//               {/* Sale Price */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Sale Price (৳) <span className='text-red-500'>*</span>
//                 </label>
//                 <input
//                   type='number'
//                   step='0.01'
//                   min='0'
//                   value={formData.price || ""}
//                   onChange={e => handleNumberChange("price", e.target.value)}
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                     errors.price
//                       ? "border-red-500 focus:border-red-500"
//                       : "border-gray-200 focus:border-[var(--color-orange)]"
//                   }`}
//                   placeholder='0.00'
//                 />
//                 {errors.price && (
//                   <p className='mt-1 text-sm text-red-500 flex items-center gap-1'>
//                     <AlertCircle className='w-4 h-4' />
//                     {errors.price}
//                   </p>
//                 )}
//               </div>

//               {/* Discount Percentage */}
//               <div>
//                 <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                   Discount (%)
//                 </label>
//                 <input
//                   type='number'
//                   min='0'
//                   max='100'
//                   value={formData.discount || 0}
//                   onChange={handleInputChange}
//                   name='discount'
//                   className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors bg-gray-50'
//                   readOnly
//                 />
//                 <p className='mt-1 text-xs text-gray-500'>Auto-calculated from prices</p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Images */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <div className='flex items-center justify-between mb-6'>
//               <h2 className='text-2xl font-bold text-[var(--color-text-dark)] flex items-center gap-2'>
//                 <ImageIcon className='w-6 h-6 text-[var(--color-orange)]' />
//                 Product Images
//               </h2>
//               <button
//                 type='button'
//                 onClick={addImageField}
//                 className='flex items-center gap-2 px-4 py-2 bg-[var(--color-orange)] text-white rounded-lg hover:bg-[var(--color-orange-dark)] transition-colors'
//               >
//                 <Plus className='w-4 h-4' />
//                 Add Image
//               </button>
//             </div>

//             <div className='space-y-4'>
//               {images.map((image, index) => (
//                 <div
//                   key={index}
//                   className='flex items-start gap-3'
//                 >
//                   <div className='flex-1'>
//                     <label className='block text-sm font-semibold text-gray-700 mb-2'>
//                       Image URL {index === 0 && <span className='text-red-500'>*</span>}
//                       {index === 0 && (
//                         <span className='text-xs font-normal text-gray-500 ml-2'>(Main Image)</span>
//                       )}
//                     </label>
//                     <input
//                       type='url'
//                       value={image}
//                       onChange={e => handleImageChange(index, e.target.value)}
//                       className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
//                         index === 0 && errors.image
//                           ? "border-red-500 focus:border-red-500"
//                           : "border-gray-200 focus:border-[var(--color-orange)]"
//                       }`}
//                       placeholder='https://example.com/image.jpg'
//                     />
//                   </div>
//                   {image && (
//                     <div className='w-20 h-20 mt-8 rounded-lg overflow-hidden border-2 border-gray-200'>
//                       <img
//                         src={image}
//                         alt={`Preview ${index + 1}`}
//                         className='w-full h-full object-cover'
//                       />
//                     </div>
//                   )}
//                   {images.length > 1 && (
//                     <button
//                       type='button'
//                       onClick={() => removeImageField(index)}
//                       className='mt-8 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
//                     >
//                       <X className='w-5 h-5' />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               {errors.image && (
//                 <p className='text-sm text-red-500 flex items-center gap-1'>
//                   <AlertCircle className='w-4 h-4' />
//                   {errors.image}
//                 </p>
//               )}
//             </div>
//           </motion.div>

//           {/* Description */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <h2 className='text-2xl font-bold text-[var(--color-text-dark)] mb-6'>Description</h2>

//             <textarea
//               name='description'
//               value={formData.description}
//               onChange={handleInputChange}
//               rows={8}
//               className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors resize-none'
//               placeholder='Enter detailed product description...'
//             />
//             <p className='mt-2 text-xs text-gray-500'>
//               Tip: Use line breaks to separate paragraphs
//             </p>
//           </motion.div>

//           {/* Features */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <div className='flex items-center justify-between mb-6'>
//               <h2 className='text-2xl font-bold text-[var(--color-text-dark)]'>Product Features</h2>
//               <button
//                 type='button'
//                 onClick={addFeature}
//                 className='flex items-center gap-2 px-4 py-2 bg-[var(--color-orange)] text-white rounded-lg hover:bg-[var(--color-orange-dark)] transition-colors'
//               >
//                 <Plus className='w-4 h-4' />
//                 Add Feature
//               </button>
//             </div>

//             <div className='space-y-3'>
//               {formData.features?.map((feature, index) => (
//                 <div
//                   key={index}
//                   className='flex items-center gap-3'
//                 >
//                   <input
//                     type='text'
//                     value={feature}
//                     onChange={e => handleFeatureChange(index, e.target.value)}
//                     className='flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                     placeholder='Enter product feature'
//                   />
//                   {(formData.features?.length || 0) > 1 && (
//                     <button
//                       type='button'
//                       onClick={() => removeFeature(index)}
//                       className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
//                     >
//                       <X className='w-5 h-5' />
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Specifications */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <h2 className='text-2xl font-bold text-[var(--color-text-dark)] mb-6'>
//               Technical Specifications
//             </h2>

//             {/* Add Specification */}
//             <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
//               <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
//                 <div className='md:col-span-5'>
//                   <input
//                     type='text'
//                     value={newSpecKey}
//                     onChange={e => setNewSpecKey(e.target.value)}
//                     className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                     placeholder='Key (e.g., Pages, ISBN)'
//                   />
//                 </div>
//                 <div className='md:col-span-5'>
//                   <input
//                     type='text'
//                     value={newSpecValue}
//                     onChange={e => setNewSpecValue(e.target.value)}
//                     className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
//                     placeholder='Value (e.g., 320, 978-0735211292)'
//                   />
//                 </div>
//                 <div className='md:col-span-2'>
//                   <button
//                     type='button'
//                     onClick={addSpecification}
//                     disabled={!newSpecKey || !newSpecValue}
//                     className='w-full px-4 py-3 bg-[var(--color-orange)] text-white rounded-lg hover:bg-[var(--color-orange-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
//                   >
//                     <Plus className='w-5 h-5 mx-auto' />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Specifications List */}
//             {formData.specifications && Object.keys(formData.specifications).length > 0 && (
//               <div className='space-y-2'>
//                 {Object.entries(formData.specifications).map(([key, value]) => (
//                   <div
//                     key={key}
//                     className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
//                   >
//                     <div className='flex-1 grid grid-cols-2 gap-4'>
//                       <span className='font-semibold text-gray-700'>{key}</span>
//                       <span className='text-gray-600'>{value}</span>
//                     </div>
//                     <button
//                       type='button'
//                       onClick={() => removeSpecification(key)}
//                       className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'
//                     >
//                       <X className='w-4 h-4' />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(!formData.specifications || Object.keys(formData.specifications).length === 0) && (
//               <p className='text-center text-gray-500 py-8'>
//                 No specifications added yet. Use the form above to add specifications.
//               </p>
//             )}
//           </motion.div>

//           {/* Submit Buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className='bg-white rounded-2xl shadow-lg p-6'
//           >
//             <div className='flex flex-wrap items-center justify-end gap-4'>
//               {onCancel && (
//                 <button
//                   type='button'
//                   onClick={onCancel}
//                   className='px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold'
//                 >
//                   Cancel
//                 </button>
//               )}
//               <button
//                 type='submit'
//                 disabled={isSubmitting}
//                 className='flex items-center gap-2 px-8 py-3 bg-[var(--color-orange)] text-white rounded-lg hover:bg-[var(--color-orange-dark)] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className='w-5 h-5 animate-spin' />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className='w-5 h-5' />
//                     {existingProduct ? "Update Product" : "Save Product"}
//                   </>
//                 )}
//               </button>
//             </div>
//           </motion.div>
//         </form>

//         {/* Preview Modal */}
//         {showPreview && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
//             onClick={() => setShowPreview(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               onClick={e => e.stopPropagation()}
//               className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6'
//             >
//               <div className='flex items-center justify-between mb-4'>
//                 <h3 className='text-2xl font-bold text-[var(--color-text-dark)]'>
//                   Product Preview
//                 </h3>
//                 <button
//                   onClick={() => setShowPreview(false)}
//                   className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
//                 >
//                   <X className='w-6 h-6' />
//                 </button>
//               </div>
//               <div className='space-y-4'>
//                 <div className='p-4 bg-gray-50 rounded-lg'>
//                   <h4 className='font-bold text-lg mb-2'>{formData.title || "Product Title"}</h4>
//                   <p className='text-gray-600'>by {formData.author || "Author Name"}</p>
//                   <div className='mt-2 flex items-center gap-4'>
//                     <span className='text-2xl font-bold text-[var(--color-orange)]'>
//                       ৳{formData.price?.toFixed(2) || "0.00"}
//                     </span>
//                     {formData.originalPrice && formData.originalPrice > 0 && (
//                       <>
//                         <span className='text-gray-400 line-through'>
//                           ৳{formData.originalPrice.toFixed(2)}
//                         </span>
//                         {formData.discount && formData.discount > 0 && (
//                           <span className='bg-yellow-400 px-2 py-1 rounded-full text-sm font-bold'>
//                             {formData.discount}% OFF
//                           </span>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {images[0] && (
//                   <div className='grid grid-cols-2 gap-2'>
//                     {images
//                       .filter(img => img)
//                       .map((img, idx) => (
//                         <img
//                           key={idx}
//                           src={img}
//                           alt={`Preview ${idx + 1}`}
//                           className='w-full h-48 object-cover rounded-lg'
//                         />
//                       ))}
//                   </div>
//                 )}

//                 {formData.description && (
//                   <div className='p-4 bg-gray-50 rounded-lg'>
//                     <h5 className='font-bold mb-2'>Description</h5>
//                     <p className='text-gray-600 whitespace-pre-wrap'>{formData.description}</p>
//                   </div>
//                 )}

//                 {formData.features && formData.features.filter(f => f.trim()).length > 0 && (
//                   <div className='p-4 bg-gray-50 rounded-lg'>
//                     <h5 className='font-bold mb-2'>Features</h5>
//                     <ul className='list-disc list-inside space-y-1'>
//                       {formData.features
//                         .filter(f => f.trim())
//                         .map((feature, idx) => (
//                           <li
//                             key={idx}
//                             className='text-gray-600'
//                           >
//                             {feature}
//                           </li>
//                         ))}
//                     </ul>
//                   </div>
//                 )}

//                 {formData.specifications && Object.keys(formData.specifications).length > 0 && (
//                   <div className='p-4 bg-gray-50 rounded-lg'>
//                     <h5 className='font-bold mb-2'>Specifications</h5>
//                     <div className='space-y-2'>
//                       {Object.entries(formData.specifications).map(([key, value]) => (
//                         <div
//                           key={key}
//                           className='flex justify-between'
//                         >
//                           <span className='font-semibold text-gray-700'>{key}:</span>
//                           <span className='text-gray-600'>{value}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default AdminProductForm;
