import { memo } from "react";
import { PRODUCT_TYPE_CONFIG } from "../config";

interface Props {
  type: string;
}

const ProductTypeBadge = memo(({ type }: Props) => {
  const config = PRODUCT_TYPE_CONFIG[type];
  if (!config) return null;
  const { Icon, color, label } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      <Icon
        className='w-3 h-3'
        aria-hidden='true'
      />
      {label}
    </span>
  );
});
ProductTypeBadge.displayName = "ProductTypeBadge";

export default ProductTypeBadge;
