import ProductCard from "./ProductCard.tsx";

export default function Page() {
  return (
    <main className='min-h-screen bg-white flex items-center justify-center gap-8 p-12 flex-wrap'>
      <ProductCard
        name='VR Headset'
        description='Lorem ipsum dolor sit amet, ederereli consectetuer adipis.'
        price={89}
        rating={4}
        image='/images/b1.jpg'
        accentColor='pink'
        specs={[
          { title: "Display", description: "4K per eye, 120Hz refresh rate" },
          { title: "Battery", description: "Up to 3 hours continuous use" },
          { title: "Weight", description: "503g with head strap" },
        ]}
      />

      <ProductCard
        name='Smart Watch'
        description='Lorem ipsum dolor sit amet, ederereli consectetuer adipis.'
        price={89}
        rating={3}
        image='/images/b2.jpg'
        accentColor='orange'
        specs={[
          { title: "Battery", description: "7-day battery life, fast charge" },
          { title: "Display", description: '1.4" AMOLED always-on display' },
          { title: "Water", description: "5ATM water resistance rating" },
        ]}
      />
    </main>
  );
}
