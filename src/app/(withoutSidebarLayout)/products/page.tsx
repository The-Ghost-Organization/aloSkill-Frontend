import b1 from "../../../../public/images/b1.jpg";
import ProductCard from "./ProductCard.tsx";
export default function Page() {
  return (
    <main className='min-h-screen bg-white flex items-center justify-center gap-8 p-16 flex-wrap'>
      <ProductCard
        name={"Product\nName"}
        description='Lorem ipsum dolor sit amet, ederereli consectetuer adipis.'
        price={89}
        rating={4}
        image={b1}
        accentColor='pink'
        specs={[
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
        ]}
      />

      <ProductCard
        name={"Product\nName"}
        description='Lorem ipsum dolor sit amet, ederereli consectetuer adipis.'
        price={89}
        rating={4}
        image='/images/b2.jpg'
        accentColor='orange'
        specs={[
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
          { title: "Your Title", description: "Lorem ipsum dolor sit amet, consectetuer" },
        ]}
      />
    </main>
  );
}
