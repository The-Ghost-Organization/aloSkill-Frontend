import SectionMiddleHeader from "@/components/sections/SectionMiddleHeader.tsx";
import FadeSlider from "@/components/slider/FadeSlider.tsx";
import TrustedBadge from "../(TrustedBadge)/TrustedBadge.tsx";
import TestimonialCard from "./TestimonialCard.tsx";

export default function TestimonialSlider() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      company: "TechVision Inc.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      rating: 5,
      testimonial:
        "This product has completely transformed how we operate. The ROI was visible within the first month, and our team productivity increased by 300%. I can't imagine going back to our old system.",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "InnovateCo",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      rating: 5,
      testimonial:
        "Exceptional quality and outstanding customer support. The team went above and beyond to ensure our success. This is exactly what we needed to scale our operations efficiently.",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "Growth Labs",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      rating: 5,
      testimonial:
        "A game-changer for our business! The intuitive interface and powerful features have streamlined our workflow dramatically. Our conversion rates have doubled since implementation.",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      name: "David Thompson",
      role: "CTO",
      company: "DataStream Solutions",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      rating: 5,
      testimonial:
        "The technical excellence and scalability of this solution impressed our entire engineering team. It handles our complex requirements with ease and the performance is outstanding.",
      bgGradient: "from-orange-50 to-amber-50",
    },
  ];

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10 px-4'>
      <div className='max-w-5xl mx-auto'>
        <SectionMiddleHeader
          title={"What Our Clients Say"}
          subtitle='Join thousands of satisfied customers who have transformed their business with our solution'
        />

        {/* Slider Container */}
        <div className='relative h-[500px] '>
          <FadeSlider
            slides={testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                {...testimonial}
              />
            ))}
            autoplay
            autoplayInterval={6000}
            loop
            showArrows={false}
            showDots={false}
            className='w-full h-full'
          />
        </div>
      </div>
      <TrustedBadge />
    </div>
  );
}
