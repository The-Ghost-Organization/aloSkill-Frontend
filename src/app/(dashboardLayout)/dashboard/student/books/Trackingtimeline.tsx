import { type PhysicalBookItem } from "./Book";

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TrackingTimeline({ book }: { book: PhysicalBookItem }) {
  const isCancelled = book.status === "cancelled";

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5">
      <div className="grid gap-6 sm:grid-cols-[1fr_1.4fr]">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4 text-gray-500">
            <span>Order ID</span>
            <span className="font-medium text-gray-800">{book.orderId}</span>
          </div>
          {book.trackingId && (
            <div className="flex justify-between gap-4 text-gray-500">
              <span>Tracking ID</span>
              <span className="font-medium text-gray-800">{book.trackingId}</span>
            </div>
          )}
          {book.courier && (
            <div className="flex justify-between gap-4 text-gray-500">
              <span>Courier</span>
              <span className="font-medium text-gray-800">{book.courier}</span>
            </div>
          )}
          {book.estimatedDelivery && !isCancelled && (
            <div className="flex justify-between gap-4 text-gray-500">
              <span>Estimated delivery</span>
              <span className="font-medium text-gray-800">
                {formatDate(book.estimatedDelivery)}
              </span>
            </div>
          )}
          {book.address && (
            <div className="flex justify-between gap-4 text-gray-500">
              <span>Delivering to</span>
              <span className="font-medium text-gray-800">{book.address}</span>
            </div>
          )}
        </div>

        <ol className="flex flex-col gap-0">
          {book.timeline.map((step, i) => {
            const isLast = i === book.timeline.length - 1;
            return (
              <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    className={`absolute left-1.25 top-3 h-full w-px ${
                      step.completed ? "bg-orange-300" : "bg-gray-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 mt-1 h-2.75 w-2.75 shrink-0 rounded-full border-2 ${
                    step.completed
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300 bg-white"
                  }`}
                />
                <div className="flex flex-1 items-center justify-between">
                  <span
                    className={`text-sm ${
                      step.completed ? "font-medium text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(step.date) ?? "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
