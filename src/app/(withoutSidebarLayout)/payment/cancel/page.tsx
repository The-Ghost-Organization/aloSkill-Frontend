import { Suspense } from "react";
import EPSPaymentResult from "../EPSPaymentResult";

export default function EPSPaymentCancelPage() {
  return <Suspense fallback={null}><EPSPaymentResult expectedOutcome='cancel' /></Suspense>;
}
