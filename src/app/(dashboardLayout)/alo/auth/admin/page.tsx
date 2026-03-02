import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ password?: string }>;
};

const AloAdminPage = async ({ searchParams }: Props) => {
  const validPassword = ["secretPassword", "guptopassword", "besisecretPassword"];
  const { password } = await searchParams;
  if (!password || !validPassword.includes(password)) {
    redirect("/");
  }
  return (
    <main className='min-h-screen flex items-center justify-center bg-zinc-50 p-6'>
      <div className='w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-sm p-8'>
        {/* Header Section */}
        <div className='mb-10 text-center'>
          <h1 className='text-2xl font-bold tracking-tight text-zinc-900'>Alo Admin Portal</h1>
          <p className='text-sm text-zinc-500 mt-2'>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-zinc-700 mb-1.5'>Email Address</label>
            <input
              type='email'
              placeholder='admin@alo.com'
              className='w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-zinc-700 mb-1.5'>Password</label>
            <input
              type='password'
              placeholder='••••••••'
              className='w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400'
            />
            {password && (
              <p className='mt-2 text-xs text-amber-600 font-medium'>
                Note: Password loaded from URL query.
              </p>
            )}
          </div>

          <button
            type='submit'
            className='w-full bg-zinc-900 text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md'
          >
            Sign In
          </button>
        </form>

        {/* Debug Info Footer */}
        <div className='mt-8 pt-6 border-t border-zinc-100'>
          <div className='bg-zinc-50 rounded-md p-3 border border-zinc-200'>
            <p className='text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1'>
              Developer Debug Info
            </p>
            <p className='text-sm font-mono text-zinc-600 truncate'>
              Query Password: <span className='text-zinc-900'>{password || "None"}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AloAdminPage;
