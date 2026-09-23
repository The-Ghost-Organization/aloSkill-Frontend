import { Suspense } from "react";
import EPSPaymentResult from "../EPSPaymentResult";

export default function EPSPaymentSuccessPage() {
  return <Suspense fallback={null}><EPSPaymentResult expectedOutcome='success' /></Suspense>;
}
