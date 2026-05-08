// components/ProductCard.tsx
import Image from "next/image";

type Spec = {
  title: string;
  description: string;
};

type AccentColor = "pink" | "orange" | "purple" | "blue";

type ProductCardProps = {
  name: string;
  description: string;
  price: number;
  rating: number; // 1–5
  image: string;
  imageAlt?: string;
  specs?: Spec[]; // 3 recommended
  accentColor?: AccentColor;
  onAddToCart?: () => void;
};

const THEMES: Record<
  AccentColor,
  {
    dot: string;
    badge: string;
    body: string;
  }
> = {
  pink: {
    dot: "bg-gradient-to-br from-purple-500 to-pink-500",
    badge: "bg-pink-500",
    body: "bg-gradient-to-br from-pink-500 to-pink-700",
  },
  orange: {
    dot: "bg-gradient-to-br from-orange-500 to-red-500",
    badge: "bg-amber-400",
    body: "bg-gradient-to-br from-orange-500 to-orange-700",
  },
  purple: {
    dot: "bg-gradient-to-br from-indigo-500 to-purple-600",
    badge: "bg-purple-500",
    body: "bg-gradient-to-br from-purple-600 to-indigo-700",
  },
  blue: {
    dot: "bg-gradient-to-br from-cyan-400 to-blue-600",
    badge: "bg-blue-500",
    body: "bg-gradient-to-br from-blue-500 to-blue-700",
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
          className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-white/30"}`}
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
    // Outer wrapper — transparent so it sits on any bg (white page, dark section, etc.)
    <div className='relative w-[260px] flex flex-col overflow-visible'>
      {/* Decorative dot — top-left */}
      <div className={`absolute top-3 left-3 w-7 h-7 rounded-full z-10 ${theme.dot}`} />

      {/* Price badge — top-right */}
      <span
        className={`absolute top-2.5 right-3 z-10 ${theme.badge} text-white text-[15px] font-extrabold px-3 py-1 rounded-xl shadow-md tracking-wide`}
      >
        ${price}
      </span>

      {/* Product image — floats above the card body */}
      <div className='relative z-10 h-48 flex items-end justify-center pb-0 pointer-events-none select-none'>
        <Image
          src={image}
          alt={imageAlt ?? name}
          width={220}
          height={190}
          className='object-contain drop-shadow-2xl'
          priority
        />
      </div>

      {/* Info card — sits behind / below image with negative margin pull-up */}
      <div className={`relative z-0 -mt-5 rounded-[18px] px-4 pt-5 pb-4 ${theme.body}`}>
        {/* Main content row */}
        <div className='flex gap-3'>
          {/* Left column: name + description + stars */}
          <div className='flex flex-col gap-1.5 flex-[1.1]'>
            <h2 className='text-white font-black text-[22px] uppercase leading-none tracking-wide font-sans'>
              {name}
            </h2>
            <p className='text-white/80 text-[11px] leading-relaxed'>{description}</p>
            <StarRating rating={rating} />
          </div>

          {/* Divider */}
          {specs.length > 0 && (
            <div className='w-px bg-white/25 self-stretch flex-shrink-0 mx-0.5' />
          )}

          {/* Right column: specs */}
          {specs.length > 0 && (
            <div className='flex flex-col gap-2 flex-1'>
              {specs.slice(0, 3).map((spec, i) => (
                <div key={i}>
                  <p className='text-white text-[11px] font-bold uppercase tracking-wide leading-none mb-0.5'>
                    {spec.title}
                  </p>
                  <p className='text-white/75 text-[10.5px] leading-snug'>{spec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA button */}
        <button className='mt-4 w-full border-2 border-white/80 text-white text-[13px] font-black uppercase tracking-[0.12em] rounded-full py-2 bg-transparent hover:bg-white/15 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
