import FadeSlider from "@/components/slider/FadeSlider";
import Image from "next/image";

export function SidebarImageSlider() {
 const images = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
];

  return (
    <div className="h-48 relative rounded-xl overflow-hidden shadow-md">
      <FadeSlider
        slides={images.map((src, i) => (
          <div key={i} className="relative w-full h-full">
            <Image
              src={src}
              alt={`Book ${i + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
        autoplay
        autoplayInterval={3000}
        loop
        showArrows={true}
        showDots={true}
        className="w-full h-full"
      />
    </div>
  );
}