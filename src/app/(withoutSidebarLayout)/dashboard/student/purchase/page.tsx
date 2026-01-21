"use client";

import { ChevronDown, ChevronUp, Clock, CreditCard, DollarSign } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const PurchaseHistory = () => {
  const [expandedDates, setExpandedDates] = useState<Record<number, boolean>>({});

  const purchaseData = [
    {
      date: "1st September, 2021 at 11:30 PM",
      courses: 3,
      amount: 750.0,
      paymentMethod: "Credit Card",
      items: [
        {
          id: 1,
          title: "Learn Ethical Hacking From Scratch",
          instructor: "Zaid Sabih",
          rating: 4.7,
          reviews: 451444,
          price: 13.99,
          image:
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
        },
        {
          id: 2,
          title: "Mega Digital Marketing Course A-Z: 12 Courses in 1 + Updates",
          instructor: "Edmar Howard",
          rating: 4.7,
          reviews: 451444,
          price: 49.0,
          image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
        },
      ],
      customer: "Kevin Gilbert",
      cardLast4: "4142",
      orderNumber: "04124",
    },
    {
      date: "1st September, 2021 at 11:30 PM",
      courses: 3,
      amount: 1700.0,
      paymentMethod: "Credit Card",
      items: [],
    },
    {
      date: "31st August, 2021 at 11:30 PM",
      courses: 52,
      amount: 6207.0,
      paymentMethod: "Credit Card",
      items: [],
    },
    {
      date: "24th August, 2021 at 6:34 PM",
      courses: 1,
      amount: 89.0,
      paymentMethod: "Credit Card",
      items: [],
    },
    {
      date: "1st September, 2021 at 8:47 PM",
      courses: 1,
      amount: 325.0,
      paymentMethod: "Credit Card",
      items: [],
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedDates(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className='min-h-screen'>
      <h3 className='font-bold text-gray-800 mb-5'>Purchase History</h3>

      <div className='space-y-4'>
        {purchaseData.map((purchase, index) => (
          <div
            key={index}
            className='bg-white rounded shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden'
          >
            {/* Header Section */}
            <div
              className={`p-4 cursor-pointer transition-colors duration-200 ${
                expandedDates[index]
                  ? "bg-gradient-to-r from-pink-50 to-purple-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => toggleExpand(index)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <h4 className='font-semibold text-gray-800 mb-2'>{purchase.date}</h4>
                  <div className='flex items-center gap-6 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      <span>{purchase.courses} Courses</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <DollarSign className='w-4 h-4' />
                      <span className='font-medium'>${purchase.amount.toFixed(2)} USD</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <CreditCard className='w-4 h-4 text-green-600' />
                      <span className='text-green-600'>{purchase.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <button
                  className={`ml-4 p-2 rounded bg-gray-100 hover:bg-white transition-colors duration-200 cursor-pointer ${expandedDates[index] ? "bg-orange-light" : ""}`}
                  aria-label={expandedDates[index] ? "Collapse" : "Expand"}
                >
                  {expandedDates[index] ? (
                    <ChevronUp className='w-5 h-5 text-orange-dark' />
                  ) : (
                    <ChevronDown className='w-5 h-5 text-gray-600' />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedDates[index] && purchase.items.length > 0 && (
              <div className='border-t border-gray-100'>
                {/* Course Items */}
                <div className='p-5 space-y-4'>
                  {purchase.items.map(item => (
                    <div
                      key={item.id}
                      className='flex gap-4 p-4 rounded bg-gray-50 hover:bg-gray-100 transition-colors duration-200'
                    >
                      <Image
                        width={80}
                        height={80}
                        src={item.image}
                        alt={item.title}
                        className='w-24 h-18 object-cover rounded-lg flex-shrink-0'
                      />
                      <div className='flex-1'>
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <h4 className='font-semibold text-gray-800 mb-1 line-clamp-2'>
                              {item.title}
                            </h4>
                            <p className='text-sm text-gray-600'>Course by: {item.instructor}</p>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                <span className='text-yellow-500 font-semibold'>{item.rating}</span>
                                <span className='text-xs text-gray-500'>
                                  ({item.reviews.toLocaleString()} Reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='text-right flex-shrink-0'>
                            <p className='text-xl font-bold text-orange-500'>${item.price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details Footer */}
                <div className='bg-gradient-to-r from-orange-50 to-pink-50 p-5 border-t border-gray-100'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-8'>
                      <div>
                        <span className='text-gray-600'>Date: </span>
                        <span className='font-semibold text-gray-800'>{purchase.date}</span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Courses: </span>
                        <span className='font-semibold text-gray-800'>{purchase.courses}</span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Amount: </span>
                        <span className='font-semibold text-gray-800'>
                          ${purchase.amount.toFixed(2)} USD
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <CreditCard className='w-4 h-4 text-green-600' />
                        <span className='text-green-600 font-medium'>{purchase.paymentMethod}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-gray-600'>{purchase.customer}</div>
                      <div className='text-gray-800 font-mono'>
                        •••• •••• •••• {purchase.cardLast4}
                      </div>
                      <div className='text-gray-500 text-xs mt-1'>#{purchase.orderNumber}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State for No Items */}
            {expandedDates[index] && purchase.items.length === 0 && (
              <div className='p-8 text-center border-t border-gray-100'>
                <p className='text-gray-500'>No course details available for this purchase</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;
