import ProductCard from "./ProductCard.tsx";

export default function Page() {
  return (
    <main className='relative min-h-screen bg-white overflow-hidden flex items-center justify-center gap-10 p-16 flex-wrap'>
      {/*
        ✅ Decorative background blobs — required for glassmorphism to
        be visible on a white background. The card's backdrop-blur
        blurs THESE, creating the frosted-glass effect.
      */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl' />
        <div className='absolute top-10 right-10 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl' />
        <div className='absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl' />
        <div className='absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl' />
      </div>

      {/* Cards sit above the blobs */}
      <div className='relative z-10 flex items-center justify-center gap-10 flex-wrap'>
        <ProductCard
          name={"Atomic\nHabits"}
          description='Tiny changes, remarkable results. A proven way to build good habits.'
          price={19}
          rating={5}
          image='https://images.unsplash.com/photo-1657617120177-5da78daa5066?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          accentColor='pink'
          specs={[
            { title: "Author", description: "James Clear" },
            { title: "Pages", description: "320 pages" },
            { title: "Genre", description: "Self-help" },
          ]}
        />

        <ProductCard
          name={"Deep\nWork"}
          description='Rules for focused success in a distracted world.'
          price={17}
          rating={4}
          image='https://images.unsplash.com/photo-1539545880148-642b8c315b4d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          accentColor='orange'
          specs={[
            { title: "Author", description: "Cal Newport" },
            { title: "Pages", description: "296 pages" },
            { title: "Genre", description: "Business" },
          ]}
        />
        <ProductCard
          name={"Deep\nWork"}
          description='Rules for focused success in a distracted world.'
          price={17}
          rating={4}
          image='https://images.unsplash.com/photo-1539545880148-642b8c315b4d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          accentColor='orange'
          specs={[
            { title: "Author", description: "Cal Newport" },
            { title: "Pages", description: "296 pages" },
            { title: "Genre", description: "Business" },
          ]}
        />
      </div>
    </main>
  );
}
