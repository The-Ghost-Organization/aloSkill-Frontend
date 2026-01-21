// "use client";

// import { useState } from "react";

// export default function NewsletterSection() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(null);

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setMessage(null);

//     if (!email) {
//       setMessage({ type: "error", text: "Email is required." });
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/newsletter/subscribe", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "Failed to subscribe");
//       }

//       setMessage({ type: "success", text: "Successfully subscribed!" });
//       setEmail("");
//     } catch (err) {
//       setMessage({ type: "error", text: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className='py-16 px-4 text-center'>
//       <h2 className='text-3xl font-bold mb-4'>Subscribe to our Newsletter</h2>

//       <form
//         onSubmit={handleSubmit}
//         className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'
//       >
//         <input
//           type='email'
//           placeholder='Enter your email'
//           className='flex-1 px-4 py-2 rounded border border-gray-300'
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           disabled={loading}
//         />

//         <button
//           type='submit'
//           disabled={loading}
//           className='px-6 py-2 bg-black text-white rounded disabled:opacity-50'
//         >
//           {loading ? "..." : "Subscribe"}
//         </button>
//       </form>

//       {message && (
//         <p
//           className={`mt-3 text-sm ${
//             message.type === "success" ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {message.text}
//         </p>
//       )}
//     </section>
//   );
// }
