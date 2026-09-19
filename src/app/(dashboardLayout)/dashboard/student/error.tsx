"use client";

import DashboardState from "./components/DashboardState";

export default function StudentDashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <DashboardState
      kind='error'
      title='This dashboard tab could not be loaded'
      description='Your account data is safe. Try loading this section again.'
      action={<button type='button' onClick={reset} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Try again</button>}
    />
  );
}
