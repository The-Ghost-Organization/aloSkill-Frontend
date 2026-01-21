// import { config } from "@/config/env.ts";

// // app/auth/verify/page.tsx
// export default async function VerifyEmailPage({
//   searchParams,
// }: {
//   searchParams: { id: string; token: string }
// }) {
//   // Call backend to verify token
//   const response = await fetch(
//     `${config.BACKEND_API_URL}/auth/verify`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id: searchParams.id,
//         token: searchParams.token,
//       }),
//     }
//   )

//   if (response.ok) {
//     return <SuccessMessage />
//   } else {
//     return <ErrorMessage />
//   }
// }

// // Dummy SuccessMessage component
// function SuccessMessage() {
//   return <div>Email verified successfully!</div>;
// }

// // Dummy ErrorMessage component
// function ErrorMessage() {
//   return <div>Verification failed. Please try again.</div>;
// }
