import { Suspense } from "react";
import EPSPaymentResult from "../EPSPaymentResult";

export default function EPSPaymentFailPage() {
  return <Suspense fallback={null}><EPSPaymentResult expectedOutcome='fail' /></Suspense>;
}
