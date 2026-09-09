export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col bg-gray-50 '>
      <main className=''>{children}</main>
    </div>
  );
}
