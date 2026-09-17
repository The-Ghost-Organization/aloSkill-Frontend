interface CardProps {
  type: "bank" | "mfs";
  provider: "visa" | "mastercard" | "bkash" | "nagad" | "rocket" | "qcash";
  accountName: string;
  accountNumber: string;
  expiry?: string;
}

const PaymentCard = ({ type, provider, accountName, accountNumber, expiry }: CardProps) => {
  const formatNumber = () => {
    if (type === "bank") {
      const first4 = accountNumber.slice(0, 4);
      const last4 = accountNumber.slice(-4);
      return `${first4} **** **** ${last4}`;
    } else {
      const first3 = accountNumber.slice(0, 3);
      const last2 = accountNumber.slice(-2);
      return `${first3} *** *** ${last2}`;
    }
  };

  const styles = {
    visa: "bg-gradient-to-br from-indigo-600 to-purple-700",
    bkash: "bg-gradient-to-br from-pink-500 to-rose-600",
    nagad: "bg-gradient-to-br from-orange-500 to-red-600",
    rocket: "bg-gradient-to-br from-purple-700 to-indigo-900",
    qcash: "bg-gradient-to-br from-blue-700 to-cyan-600",
    mastercard: "bg-gradient-to-br from-gray-800 to-black",
  };

  return (
    <div
      className={`relative w-full h-56 rounded p-4 text-white shadow transition-transform ${styles[provider]} overflow-hidden`}
    >
      {/* Background Pattern Decor */}
      <div className='absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 italic'></div>
      <div className='absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mb-16 italic'></div>

      <div className='absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mt-16 italic'></div>
      <div className='absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16 italic'></div>

      {/* Top Row: Brand & Menu */}
      <div className='flex justify-between items-start'>
        <h2 className='text-3xl font-bold tracking-tighter uppercase'>{provider}</h2>
        <div className='flex space-x-1'>
          <div className='w-1 h-1 bg-white rounded-full'></div>
          <div className='w-1 h-1 bg-white rounded-full'></div>
          <div className='w-1 h-1 bg-white rounded-full'></div>
        </div>
      </div>

      {/* Middle Row: Account Number */}
      <div className='mt-10 flex items-center justify-between'>
        <p className='text-xl font-medium'>{formatNumber()}</p>
        <button className='opacity-70 hover:opacity-100'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
            />
          </svg>
        </button>
      </div>

      {/* Bottom Row: Info */}
      <div className='mt-auto pt-8 flex justify-between items-end'>
        <div>
          <p className='text-[10px] uppercase opacity-80 font-semibold tracking-wider'>
            Valid Thru
          </p>
          <p className='text-sm font-medium'>{expiry || "N/A"}</p>
        </div>
        <div className='text-right'>
          <p className='text-[10px] uppercase opacity-80 font-semibold tracking-wider'>
            Card Holder
          </p>
          <p className='text-sm font-medium'>{accountName}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
