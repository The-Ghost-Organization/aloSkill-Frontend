"use client";

import { CreditCard, Send, X } from "lucide-react";
import { useState } from "react";

const PaymentModal = ({
  setModalOpen,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleSubmit = () => {
    setModalOpen(false);
  };

  const handleChange = (field: string, value: HTMLInputElement["value"]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div className='fixed inset-0 bg-gray-600/60 bg-opacity-50 flex items-center justify-center z-50'>
        {/* Modal Container */}
        <div className='bg-white rounded w-full max-w-md'>
          {/* Modal Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
            <h3 className='font-semibold text-gray-900'>New Payment Card</h3>
            <button
              onClick={() => setModalOpen(false)}
              className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-500' />
            </button>
          </div>

          {/* Modal Body */}
          <div className='p-4 space-y-5'>
            {/* Name on Card */}
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-1'>Name</label>
              <input
                type='text'
                value={formData.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder='Name on card'
                className='w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
              />
            </div>

            {/* Card Number */}
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-1'>Card Number</label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                  <CreditCard className='w-5 h-5 text-orange-500' />
                </div>
                <input
                  type='text'
                  value={formData.cardNumber}
                  onChange={e => handleChange("cardNumber", e.target.value)}
                  placeholder='Label'
                  maxLength={19}
                  className='w-full pl-10 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
                />
              </div>
            </div>

            {/* MM/YY and CVC Row */}
            <div className='grid grid-cols-2 gap-4'>
              {/* MM/YY */}
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>MM / YY</label>
                <input
                  type='text'
                  value={formData.expiry}
                  onChange={e => handleChange("expiry", e.target.value)}
                  placeholder='MM / YY'
                  maxLength={5}
                  className='w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
                />
              </div>

              {/* CVC */}
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>CVC</label>
                <input
                  type='text'
                  value={formData.cvc}
                  onChange={e => handleChange("cvc", e.target.value)}
                  placeholder='Security Code'
                  maxLength={4}
                  className='w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-between pt-2'>
              <button
                onClick={() => setModalOpen(false)}
                className='px-4 py-1.5 text-gray-700 font-medium hover:bg-gray-100 rounded transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='px-4 py-1.5 bg-orange-500 text-white font-medium rounded hover:bg-orange-600 transition-colors flex items-center gap-2'
              >
                <span>Send Message</span>
                <Send className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
