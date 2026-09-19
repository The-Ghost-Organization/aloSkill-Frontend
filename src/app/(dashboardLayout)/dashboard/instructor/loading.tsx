export default function DashboardLoading() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {[1, 2, 3, 4].map(item => (
        <div key={item} className='h-24 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='h-full rounded-xl bg-slate-100' />
        </div>
      ))}
    </div>
  );
}
