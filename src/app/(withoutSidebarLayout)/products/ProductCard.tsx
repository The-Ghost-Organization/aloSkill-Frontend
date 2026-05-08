// components/ProductCard.tsx
import Image from "next/image";

type Spec = {
  title: string;
  description: string;
};

type ProductCardProps = {
  name: string;
  description: string;
  price: number;
  rating: number; // 1–5
  image: string;
  specs?: Spec[]; // max 3 recommended
  accentColor?: "pink" | "orange" | "purple" | "blue";
  onAddToCart?: () => void;
};

const ACCENT_MAP: Record<
  NonNullable<ProductCardProps["accentColor"]>,
  {
    badge: string;
    dot: string;
    card: string;
    button: string;
    divider: string;
  }
> = {
  pink: {
    badge: "bg-pink-500",
    dot: "bg-gradient-to-br from-purple-500 to-pink-500",
    card: "bg-gradient-to-br from-pink-500 to-pink-600",
    button: "border-white text-white hover:bg-white hover:text-pink-600",
    divider: "bg-white/30",
  },
  orange: {
    badge: "bg-orange-400",
    dot: "bg-gradient-to-br from-orange-400 to-red-500",
    card: "bg-gradient-to-br from-orange-500 to-orange-600",
    button: "border-white text-white hover:bg-white hover:text-orange-600",
    divider: "bg-white/30",
  },
  purple: {
    badge: "bg-purple-500",
    dot: "bg-gradient-to-br from-indigo-500 to-purple-600",
    card: "bg-gradient-to-br from-purple-600 to-indigo-600",
    button: "border-white text-white hover:bg-white hover:text-purple-600",
    divider: "bg-white/30",
  },
  blue: {
    badge: "bg-blue-500",
    dot: "bg-gradient-to-br from-cyan-500 to-blue-600",
    card: "bg-gradient-to-br from-blue-600 to-cyan-600",
    button: "border-white text-white hover:bg-white hover:text-blue-600",
    divider: "bg-white/30",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className='flex items-center gap-1'
      aria-label={`Rating: ${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-white/40"}`}
          fill='currentColor'
          viewBox='0 0 20 20'
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
  specs = [],
  accentColor = "pink",
  onAddToCart,
}: ProductCardProps) {
  const theme = ACCENT_MAP[accentColor];

  return (
    <div className='relative w-[280px] flex flex-col rounded-2xl bg-[#0f1535] shadow-2xl overflow-visible'>
      {/* Decorative dot */}
      <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${theme.dot} z-10`} />

      {/* Price badge */}
      <div
        className={`absolute top-3 right-3 ${theme.badge} text-white text-sm font-bold px-3 py-1 rounded-lg z-10 shadow-md`}
      >
        ${price}
      </div>

      {/* Product image area */}
      <div className='relative h-52 flex items-center justify-center overflow-visible px-6 pt-4'>
        <Image
          src={image}
          alt={name}
          fill
          className='object-contain drop-shadow-2xl z-10 relative'
          priority
        />
      </div>

      {/* Info card */}
      <div className={`${theme.card} rounded-2xl p-5 mx-0 mt-0 flex flex-col gap-3`}>
        {/* Name + Specs row */}
        <div className='flex gap-3'>
          {/* Left: name + description + stars */}
          <div className='flex-1 flex flex-col gap-2'>
            <h2 className='text-white font-extrabold text-xl uppercase leading-tight tracking-wide'>
              {name}
            </h2>
            <p className='text-white/80 text-xs leading-relaxed'>{description}</p>
            <StarRating rating={rating} />
          </div>

          {/* Divider */}
          {specs.length > 0 && <div className={`w-px self-stretch ${theme.divider} mx-1`} />}

          {/* Right: specs */}
          {specs.length > 0 && (
            <div className='flex-1 flex flex-col gap-2'>
              {specs.map((spec, i) => (
                <div key={i}>
                  <p className='text-white font-bold text-xs uppercase tracking-wide'>
                    {spec.title}
                  </p>
                  <p className='text-white/75 text-xs leading-snug'>{spec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          className={`mt-1 w-full border-2 ${theme.button} rounded-full py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
