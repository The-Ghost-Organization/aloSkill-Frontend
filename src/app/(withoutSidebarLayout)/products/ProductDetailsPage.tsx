"use client";
import type { Book } from "@/types/book";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface ProductDetailsPageProps {
  product: Book;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Use multiple images if available, otherwise use the main image
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment") {
      setQuantity(prev => prev + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleImageNavigation = (direction: "next" | "prev") => {
    if (direction === "next") {
      setSelectedImage(prev => (prev + 1) % images.length);
    } else {
      setSelectedImage(prev => (prev - 1 + images.length) % images.length);
    }
  };

  const tabs = [
    { id: "description", label: "DESCRIPTION" },
    { id: "additional", label: "ADDITIONAL INFORMATION" },
    { id: "specification", label: "SPECIFICATION" },
    { id: "review", label: "REVIEW" },
  ];

  const features = [
    { icon: Shield, text: "Free 1 Year Warranty" },
    { icon: Truck, text: "Free Shipping & Fasted Delivery" },
    { icon: RotateCcw, text: "100% Money-back guarantee" },
    { icon: Headphones, text: "24/7 Customer support" },
    { icon: Check, text: "Secure payment method" },
  ];

  const shipping = [
    { type: "Courier", time: "2-4 days, free shipping" },
    { type: "Local Shipping", time: "up to one week, ৳190" },
    { type: "Express Shipping", time: "4-6 days, ৳290" },
    { type: "International Export", time: "3-4 days, ৳390" },
  ];

  const paymentMethods = ["visa", "mastercard", "amex", "discover", "paypal", "apple-pay"];

  return (
    <div className='min-h-screen bg-[var(--color-bg-light)]'>
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='container mx-auto px-4 py-4'
      >
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Link
            href='/'
            className='hover:text-[var(--color-orange)] transition-colors'
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href='/shop'
            className='hover:text-[var(--color-orange)] transition-colors'
          >
            Shop
          </Link>
          <span>/</span>
          <span className='text-[var(--color-text-dark)] font-medium'>{product.title}</span>
        </div>
      </motion.div>

      {/* Main Product Section */}
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-4'
          >
            {/* Main Image */}
            <div className='relative bg-gray-100 rounded-lg overflow-hidden aspect-square'>
              <AnimatePresence mode='wait'>
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.title}
                  className='w-full h-full object-cover'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows - Only show if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-[var(--color-orange)] hover:bg-[var(--color-orange-dark)] text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--color-orange)] hover:bg-[var(--color-orange-dark)] text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product.discount && (
                <div className='absolute top-4 right-4 bg-[var(--color-orange)] text-white px-3 py-1 rounded-full text-sm font-semibold'>
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Only show if multiple images */}
            {images.length > 1 && (
              <div className='relative'>
                <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === idx
                          ? "border-[var(--color-orange)] shadow-lg"
                          : "border-gray-200 hover:border-[var(--color-orange-light)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            {/* Rating */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-[var(--color-orange)] text-[var(--color-orange)]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className='text-sm font-medium text-[var(--color-text-dark)]'>
                {product.rating} Star Rating
              </span>
              <span className='text-sm text-gray-500'>
                ({product.reviews.toLocaleString()} User feedback)
              </span>
            </div>

            {/* Title */}
            <h1 className='text-3xl lg:text-4xl font-bold text-[var(--color-text-dark)]'>
              {product.title}
            </h1>

            {/* Author */}
            <p className='text-lg text-gray-600'>
              by{" "}
              <span className='font-semibold text-[var(--color-text-dark)]'>{product.author}</span>
            </p>

            {/* Meta Info */}
            <div className='grid grid-cols-2 gap-4 text-sm'>
              {product.sku && (
                <div>
                  <span className='text-gray-600'>Sku:</span>
                  <span className='ml-2 font-medium text-[var(--color-text-dark)]'>
                    {product.sku}
                  </span>
                </div>
              )}
              {product.availability && (
                <div>
                  <span className='text-gray-600'>Availability:</span>
                  <span className='ml-2 font-medium text-green-600'>{product.availability}</span>
                </div>
              )}
              {product.brand && (
                <div>
                  <span className='text-gray-600'>Brand:</span>
                  <span className='ml-2 font-medium text-[var(--color-text-dark)]'>
                    {product.brand}
                  </span>
                </div>
              )}
              {product.category && (
                <div>
                  <span className='text-gray-600'>Category:</span>
                  <span className='ml-2 font-medium text-[var(--color-text-dark)]'>
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className='flex items-center gap-4'>
              <span className='text-lg font-bold text-[var(--color-orange)]'>
                ৳{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className='text-lg text-gray-400 line-through'>
                    ৳{product.originalPrice.toFixed(2)}
                  </span>
                  {product.discount && (
                    <span className='bg-yellow-400 text-[var(--color-text-dark)] px-3 py-1 rounded-full text-sm font-semibold'>
                      {product.discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className='flex flex-wrap items-center gap-4'>
              {/* Quantity Selector */}
              <div className='flex items-center border-2 border-gray-200 rounded-lg'>
                <button
                  onClick={() => handleQuantityChange("decrement")}
                  className='px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={quantity <= 1}
                >
                  <Minus className='w-4 h-4' />
                </button>
                <span className='px-6 py-3 font-semibold border-x-2 border-gray-200 min-w-[60px] text-center'>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increment")}
                  className='px-4 py-3 hover:bg-gray-100 transition-colors'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1 bg-[var(--color-orange)] hover:bg-[var(--color-orange-dark)] text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-200'
              >
                <ShoppingCart className='w-5 h-5' />
                ADD TO CART
              </motion.button>

              {/* Buy Now */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='border-2 border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)] hover:text-white px-8 py-4 rounded-lg font-semibold transition-all'
              >
                BUY NOW
              </motion.button>
            </div>

            {/* Wishlist & Share */}
            <div className='flex items-center gap-6 pt-4 border-t border-gray-200'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className='flex items-center gap-2 text-gray-600 hover:text-[var(--color-orange)] transition-colors'
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                Add to Wishlist
              </motion.button>
              <div className='flex items-center gap-3'>
                <span className='text-gray-600'>Share product:</span>
                <div className='flex gap-2'>
                  {["facebook", "twitter", "pinterest"].map(social => (
                    <motion.button
                      key={social}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='w-8 h-8 rounded-full bg-gray-100 hover:bg-[var(--color-orange)] hover:text-white flex items-center justify-center transition-colors'
                    >
                      <Share2 className='w-4 h-4' />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
              <h3 className='font-semibold text-[var(--color-text-dark)] text-lg mb-4'>
                100% Guarantee Safe Checkout
              </h3>
              <div className='flex flex-wrap gap-3 mb-6'>
                {paymentMethods.map((method, idx) => (
                  <div
                    key={idx}
                    className='w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center'
                  >
                    <span className='text-xs text-gray-400'>{method}</span>
                  </div>
                ))}
              </div>
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className='flex items-center gap-3'
                >
                  <div className='w-10 h-10 bg-[var(--color-orange-light)] bg-opacity-20 rounded-lg flex items-center justify-center'>
                    <feature.icon className='w-5 h-5 text-[var(--color-orange)]' />
                  </div>
                  <span className='text-gray-700'>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mt-16'
        >
          {/* Tab Navigation */}
          <div className='border-b border-gray-200'>
            <div className='flex gap-8 overflow-x-auto'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 font-semibold whitespace-nowrap transition-colors relative ${
                    activeTab === tab.id
                      ? "text-[var(--color-orange)]"
                      : "text-gray-500 hover:text-[var(--color-text-dark)]"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId='activeTab'
                      className='absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-orange)]'
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className='py-8'
            >
              {activeTab === "description" && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  <div className='lg:col-span-2'>
                    <h3 className='text-2xl font-bold text-[var(--color-text-dark)] mb-4'>
                      Description
                    </h3>
                    <div className='text-gray-700 leading-relaxed space-y-4'>
                      {product.description ? (
                        product.description
                          .split("\n\n")
                          .map((para, idx) => <p key={idx}>{para}</p>)
                      ) : (
                        <p>No description available for this product.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className='text-2xl font-bold text-[var(--color-text-dark)] mb-4'>
                      Shipping Information
                    </h3>
                    <div className='space-y-3'>
                      {shipping.map((ship, idx) => (
                        <div
                          key={idx}
                          className='flex justify-between items-start py-2'
                        >
                          <div>
                            <p className='font-semibold text-[var(--color-text-dark)]'>
                              {ship.type}:
                            </p>
                            <p className='text-sm text-gray-600'>{ship.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "additional" && (
                <div className='text-gray-700'>
                  <h3 className='text-2xl font-bold text-[var(--color-text-dark)] mb-4'>
                    Additional Information
                  </h3>
                  {product.features && product.features.length > 0 ? (
                    <ul className='list-disc list-inside space-y-2'>
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No additional information available.</p>
                  )}
                </div>
              )}
              {activeTab === "specification" && (
                <div className='text-gray-700'>
                  <h3 className='text-2xl font-bold text-[var(--color-text-dark)] mb-4'>
                    Specifications
                  </h3>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className='flex border-b border-gray-200 pb-2'
                        >
                          <span className='font-semibold text-[var(--color-text-dark)] w-1/3'>
                            {key}:
                          </span>
                          <span className='text-gray-600 w-2/3'>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === "review" && (
                <div className='text-gray-700'>
                  <h3 className='text-2xl font-bold text-[var(--color-text-dark)] mb-4'>
                    Customer Reviews
                  </h3>
                  <div className='text-center py-8 bg-gray-50 rounded-lg'>
                    <p className='text-gray-500'>Reviews section coming soon!</p>
                    <p className='text-sm text-gray-400 mt-2'>
                      Be the first to review this product.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
