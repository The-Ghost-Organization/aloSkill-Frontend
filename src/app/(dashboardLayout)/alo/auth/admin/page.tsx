"use client";

import { Eye, EyeClosed } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const AloAdminPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPassword = searchParams.get("password");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/admin";

  const validPasswords = ["secretPassword", "guptopassword", "besisecretPassword"];
  if (!queryPassword || !validPasswords.includes(queryPassword)) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "admin",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (_err) {
      setError("Unexpected error, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='min-h-screen flex items-center justify-center bg-zinc-50 p-6'>
      <div className='w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-sm p-8'>
        <div className='mb-10 text-center'>
          <h1 className='text-2xl font-bold tracking-tight text-zinc-900'>Alo Admin Portal</h1>
          <p className='text-sm text-zinc-500 mt-2'>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200'>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className='space-y-5'
        >
          <div>
            <label className='block text-sm font-medium text-zinc-700 mb-1.5'>Email Address</label>
            <input
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='admin@alo.com'
              className='w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-zinc-700 mb-1.5'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-800'
              >
                {!showPassword ? <EyeClosed/> : <Eye/>}
              </button>
            </div>
            {queryPassword && (
              <p className='mt-2 text-xs text-amber-600 font-medium'>
                Note: Password verified via URL query.
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-zinc-900 text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AloAdminPage;
