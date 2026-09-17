import { memo } from "react";
import { PAYMENT_STATUS_CONFIG } from "../config";

interface Props {
  status: string;
}

const PaymentStatusBadge = memo(({ status }: Props) => {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) return null;
  const { Icon, color, label } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
});
PaymentStatusBadge.displayName = "PaymentStatusBadge";

export default PaymentStatusBadge;