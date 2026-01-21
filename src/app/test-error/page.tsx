"use client";

import { useState } from "react";

export default function TestErrorPage() {
  const [errorType, setErrorType] = useState<
    "default" | "network" | "notFound" | "server" | "auth" | "forbidden"
  >("default");

  // Throw error at render-time based on selected type
  if (errorType === "network") {
    const err = new Error("Network Error");
    (err as any).status = 0;
    throw err;
  }
  if (errorType === "notFound") {
    const err = new Error("Page Not Found");
    (err as any).status = 404;
    throw err;
  }
  if (errorType === "server") {
    const err = new Error("Server Error");
    (err as any).status = 500;
    throw err;
  }
  if (errorType === "auth") {
    const err = new Error("Authentication Required");
    (err as any).status = 401;
    throw err;
  }
  if (errorType === "forbidden") {
    const err = new Error("Access Denied");
    (err as any).status = 403;
    throw err;
  }

  // default: no error thrown
  return (
    <div className='p-8 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Error Page Testing</h1>

      <div className='mb-4'>
        <label className='block mb-2'>Select Error Type:</label>
        <select
          className='w-full p-2 border rounded'
          value={errorType}
          onChange={e => setErrorType(e.target.value as any)}
        >
          <option value='default'>Default Error</option>
          <option value='network'>Network Error</option>
          <option value='notFound'>Not Found (404)</option>
          <option value='server'>Server Error (500)</option>
          <option value='auth'>Authentication Error (401)</option>
          <option value='forbidden'>Forbidden Error (403)</option>
        </select>
      </div>

      <p className='mt-4 text-gray-700'>
        এখন select থেকে একটি error টাইপ নিয়ো — তারপর পেজ রেন্ডার হবে এবং error throw হবে।
      </p>
    </div>
  );
}
