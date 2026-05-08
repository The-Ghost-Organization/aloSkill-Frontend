// components/ProductCard.tsx
import type { StaticImageData } from "next/image";
import Image from "next/image";

type Spec = { title: string; description: string };
type AccentColor = "pink" | "orange" | "purple" | "blue";

type ProductCardProps = {
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string | StaticImageData;
  imageAlt?: string;
  specs?: Spec[];
  accentColor?: AccentColor;
  onAddToCart?: () => void;
};

const THEMES: Record<
  AccentColor,
  {
    dot: string;
    badge: string;
    border: string;
    accent: string;
    button: string;
  }
> = {
  pink: {
    dot: "bg-gradient-to-br from-purple-400 to-pink-500",
    badge: "bg-pink-500",
    border: "border-pink-200/80",
    accent: "text-pink-600",
    button: "border-pink-300 text-pink-600 hover:bg-pink-50/80",
  },
  orange: {
    dot: "bg-gradient-to-br from-orange-400 to-red-500",
    badge: "bg-amber-400",
    border: "border-orange-200/80",
    accent: "text-orange-600",
    button: "border-orange-300 text-orange-600 hover:bg-orange-50/80",
  },
  purple: {
    dot: "bg-gradient-to-br from-indigo-400 to-purple-600",
    badge: "bg-purple-500",
    border: "border-purple-200/80",
    accent: "text-purple-600",
    button: "border-purple-300 text-purple-600 hover:bg-purple-50/80",
  },
  blue: {
    dot: "bg-gradient-to-br from-cyan-400 to-blue-600",
    badge: "bg-blue-500",
    border: "border-blue-200/80",
    accent: "text-blue-600",
    button: "border-blue-300 text-blue-600 hover:bg-blue-50/80",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className='flex items-center gap-0.5'
      role='img'
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
          fill='currentColor'
          viewBox='0 0 20 20'
          aria-hidden='true'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({
  name,
  description,
  price,
  rating,
  image,
  imageAlt,
  specs = [],
  accentColor = "pink",
  onAddToCart,
}: ProductCardProps) {
  const theme = THEMES[accentColor];

  return (
    <div
      className={`relative w-[260px] flex flex-col overflow-visible rounded-[22px] border-2 ${theme.border}`}
    >
      {/* Decorative dot — top-left */}
      <div className={`absolute top-3 left-3 w-7 h-7 rounded-full z-10 ${theme.dot}`} />

      {/* Price badge — top-right */}
      <span
        className={`absolute top-2.5 right-3 z-10 ${theme.badge} text-white text-[15px] font-extrabold px-3 py-1 rounded-xl shadow-md tracking-wide`}
      >
        ${price}
      </span>

      {/* Book cover — portrait ratio */}
      <div className='relative z-10 h-64 flex items-end justify-center pointer-events-none select-none'>
        <div className='relative'>
          <Image
            src={image}
            alt={imageAlt ?? name}
            width={138}
            height={200}
            className='object-contain rounded-sm'
            style={{
              filter:
                "drop-shadow(0 12px 24px rgba(0,0,0,0.20)) drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
            }}
            priority
          />
          {/* Subtle right-edge — page thickness illusion */}
          <div className='absolute top-0 right-0 w-[3px] h-full bg-black/10 rounded-r-sm' />
        </div>
      </div>

      {/* ✅ Glassmorphism card body */}
      <div
        className={`
          relative z-0 -mt-6
          rounded-[18px] px-4 pt-8 pb-4
          bg-white/60 backdrop-blur-xl
          border-t-2 ${theme.border}
          shadow-xl shadow-black/[0.06]
        `}
      >
        {/* Main content row */}
        <div className='flex gap-3'>
          {/* Left: name + description + stars */}
          <div className='flex flex-col gap-1.5 flex-[1.1]'>
            <h2
              className={`font-black text-[20px] uppercase leading-tight tracking-wide ${theme.accent}`}
            >
              {name}
            </h2>
            <p className='text-gray-500 text-[11px] leading-relaxed'>{description}</p>
            <StarRating rating={rating} />
          </div>

          {/* Divider */}
          {specs.length > 0 && (
            <div className='w-px bg-gray-200 self-stretch flex-shrink-0 mx-0.5' />
          )}

          {/* Right: specs */}
          {specs.length > 0 && (
            <div className='flex flex-col gap-2 flex-1'>
              {specs.slice(0, 3).map((spec, i) => (
                <div key={i}>
                  <p className='text-gray-700 text-[11px] font-bold uppercase tracking-wide leading-none mb-0.5'>
                    {spec.title}
                  </p>
                  <p className='text-gray-400 text-[10.5px] leading-snug'>{spec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA button */}
        <button
          onClick={onAddToCart}
          className={`
            mt-4 w-full border-2 text-[13px] font-black uppercase
            tracking-[0.12em] rounded-full py-2 bg-transparent
            active:scale-[0.98] transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
            ${theme.button}
          `}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
