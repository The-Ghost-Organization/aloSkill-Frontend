"use client";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  DollarSign,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal.tsx";

const WithdrawalPage = () => {
  const [selectedCard, setSelectedCard] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Top Stats Data
  const stats = [
    {
      icon: DollarSign,
      amount: "$13,804.00",
      label: "Total Revenue",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: CreditCard,
      amount: "$16,593.00",
      label: "Current Balance",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Wallet,
      amount: "$13,184.00",
      label: "Total Withdrawals",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      icon: TrendingUp,
      amount: "$162.00",
      label: "Today Revenue",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
  ];

  // Payment Methods Data
  const paymentMethods = [
    {
      type: "Visa",
      number: "4855 **** **** ****",
      expiry: "04/24",
      holder: "Vako Shvili",
      logo: "VISA",
      verified: true,
    },
    {
      type: "Mastercard",
      number: "2865 **** **** ****",
      expiry: "04/24",
      holder: "Vako Shvili",
      logo: "MC",
      verified: false,
    },
  ];

  // Virtual Cards Data
  const cards = [
    {
      brand: "VISA",
      number: "4855 **** **** ****",
      expiry: "04/24",
      holder: "Vako Shvili",
      color: "from-indigo-600 to-purple-600",
    },
    {
      brand: "MASTERCARD",
      number: "5421 **** **** ****",
      expiry: "08/26",
      holder: "Vako Shvili",
      color: "from-pink-500 to-red-500",
    },
  ];

  // Withdrawal History Data
  const withdrawalHistory = [
    {
      date: "31 Sep, 2021 at 2:14 AM",
      method: "Visa",
      company: "American Express",
      status: "Pending",
      statusColor: "text-orange-600 bg-orange-50",
    },
    {
      date: "31 Sep, 2021 at 2:14 AM",
      method: "Visa",
      company: "American Express",
      status: "Pending",
      statusColor: "text-orange-600 bg-orange-50",
    },
    {
      date: "27 Sep, 2021 at 2:14 AM",
      method: "Mastercard",
      company: "American Express",
      status: "Completed",
      statusColor: "text-green-600 bg-green-50",
    },
    {
      date: "21 Sep, 2021 at 2:14 AM",
      method: "Visa",
      company: "American Express",
      status: "Completed",
      statusColor: "text-green-600 bg-green-50",
    },
    {
      date: "21 Sep, 2021 at 2:14 AM",
      method: "Mastercard",
      company: "American Express",
      status: "Completed",
      statusColor: "text-green-600 bg-green-50",
    },
    {
      date: "15 Sep, 2021 at 2:14 AM",
      method: "Mastercard",
      company: "American Express",
      status: "Completed",
      statusColor: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className='min-h-screen flex flex-col gap-4'>
      {/* Top Stats Cards */}
      <div className='grid grid-cols-4 gap-4'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='bg-white rounded p-2 flex items-center gap-3'
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <div className='text-lg font-bold text-gray-900'>{stat.amount}</div>
              <div className='text-sm text-gray-500'>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='flex flex-col gap-4'>
        {/* Course Statistics and Cards */}
        <div className='w-full h-[380px] flex gap-4 items-center'>
          <div className='bg-white rounded w-[60%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Statistics</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
          </div>
          {/* Course Cards */}
          <div className='bg-white rounded w-[40%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <h4 className='font-semibold'>Cards</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                Today →
              </a>
            </div>
            <div className='p-4 w-full flex flex-col gap-2'>
              {cards[selectedCard] && (
                <div
                  className={`bg-gradient-to-br ${cards[selectedCard].color} rounded p-4 text-white`}
                >
                  {/* Card Brand */}
                  <div className='flex items-center justify-between mb-9'>
                    <span className='text-2xl font-bold'>{cards[selectedCard].brand}</span>
                    <button className='p-2 hover:bg-white/20 rounded-lg transition-colors'>
                      <MoreHorizontal className='w-5 h-5' />
                    </button>
                  </div>

                  {/* Card Number */}
                  <div className='mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xl font-semibold tracking-wider'>
                        {cards[selectedCard].number}
                      </span>
                      <button className='p-1 hover:bg-white/20 rounded'>
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-xs text-white/70 mb-1'>VALID THRU</div>
                      <div className='text-sm font-semibold'>{cards[selectedCard].expiry}</div>
                    </div>
                    <div>
                      <div className='text-xs text-white/70 mb-1'>CARD HOLDER</div>
                      <div className='text-sm font-semibold'>{cards[selectedCard].holder}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Navigation Dots */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {cards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCard(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedCard === index ? "bg-orange-500 w-8" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {/* Next Card Arrow */}
                <div className='flex items-center gap-1'>
                  <button className='w-10 h-10 bg-white rounded flex items-center justify-center hover:bg-gray-50 transition-colors'>
                    <ChevronLeft className='w-5 h-5 text-gray-600' />
                  </button>
                  <button className='w-10 h-10 bg-white rounded flex items-center justify-center hover:bg-gray-50 transition-colors'>
                    <ChevronRight className='w-5 h-5 text-gray-600' />
                  </button>
                </div>
              </div>

              {/* Add new Card */}

              <div className='w-full border border-dashed'>
                <button
                  onClick={() => setModalOpen(true)}
                  className='w-full py-2 bg-white rounded flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
                >
                  <Plus className='w-5 h-5 text-gray-600 mr-3' />
                  Add New Card
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Withdraw money and Withdraw History */}
        <div className='w-full h-[380px] flex gap-4 items-center'>
          <div className='bg-white rounded w-[45%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Withdraw Your Money</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
            <div>
              {/* Payment Methods List */}
              <div className='flex flex-col gap-2 p-4'>
                <p className='text-xs'>Payment methods</p>
                {/* Payment Method Items */}
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between px-2 py-1 border border-gray-200 rounded hover:border-gray-300 transition-colors'
                  >
                    <div className='flex items-center space-x-4'>
                      {/* Logo */}
                      <div
                        className={`w-12 h-8 ${method.logo === "VISA" ? "bg-blue-600" : "bg-red-500"} rounded flex items-center justify-center text-white font-bold text-xs`}
                      >
                        {method.logo}
                      </div>

                      {/* Card Info */}
                      <div>
                        <div className='font-medium text-gray-900'>{method.number}</div>
                        <div className='text-sm text-gray-500'>{method.expiry}</div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      <span className='text-sm text-gray-600'>{method.holder}</span>
                      {method.verified ? (
                        <CheckCircle className='w-5 h-5 text-green-500' />
                      ) : (
                        <div className='w-5 h-5'></div>
                      )}
                    </div>
                  </div>
                ))}

                {/* PayPal Notice */}
                <div className='flex items-center gap-4 p-2 bg-blue-50 rounded'>
                  <div className='w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0'>
                    P
                  </div>
                  <p className='text-sm text-gray-600'>
                    Your will be redirected to your PayPal after withdrawing your order
                  </p>
                </div>
              </div>

              {/* Current Balance and Button */}
              <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
                <div>
                  <div className='text-xl font-bold text-gray-800'>$16,593.00</div>
                  <div className='text-sm text-gray-500'>Current Balance</div>
                </div>
                <button className='px-4 py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition-colors'>
                  Withdraw Money
                </button>
              </div>
            </div>
          </div>
          {/* Course Overview */}
          <div className='bg-white rounded w-[55%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <h4 className='font-semibold'>Withdraw History</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                Today →
              </a>
            </div>
            <div className='p-3'>
              {/* Table Header */}
              <div className='px-2 py-1 bg-gray-50 border-b border-gray-200'>
                <div className='grid grid-cols-12 text-xs text-gray-600 uppercase tracking-wider'>
                  <div className='col-span-4'>Date</div>
                  <div className='col-span-3 text-start'>Method</div>
                  <div className='col-span-3 text-start'>Amount</div>
                  <div className='col-span-2 text-start'>Status</div>
                </div>
              </div>

              {/* Table Rows */}
              <div className='divide-y divide-gray-100'>
                {withdrawalHistory.map((item, index) => (
                  <div
                    key={index}
                    className='p-2 hover:bg-gray-50 transition-colors'
                  >
                    <div className='grid grid-cols-12 items-center'>
                      <div className='col-span-4 flex gap-4 items-start text-xs'>{item.date}</div>

                      <div className='col-span-3 flex gap-4 items-start text-xs'>{item.method}</div>
                      <div className='col-span-3 flex gap-4 items-start text-xs'>
                        {item.company}
                      </div>
                      <div
                        className={`col-span-2 flex gap-4 items-start text-xs p-1 rounded ${item.statusColor}`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <PaymentModal setModalOpen={setModalOpen} />}
    </div>
  );
};

export default WithdrawalPage;
