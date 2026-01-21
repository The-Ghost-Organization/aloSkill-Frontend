"use client";

import { Facebook, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const socialLinks = [
  { icon: Mail, href: "mailto:info@aloskill.com", label: "Email" },
  { icon: Facebook, href: "facebook.com", label: "Facebook" },
  { icon: Instagram, href: "facebook.com", label: "Instagram" },
];

const languages = [
  { code: "en", label: "Eng" },
  { code: "bn", label: "বাংলা" },
];

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "BDT", symbol: "৳" },
  { code: "EUR", symbol: "€" },
];

export default function AnnouncementBar() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  return (
    <div className=' z-50 bg-(--color-orange) w-full text-white'>
      <div className='w-full mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between py-2 text-sm'>
          {/* Left: Announcement Text */}
          <div className='hidden md:block'>
            <p className='text-white/90'>Welcome to আলো স্কিল online learning platform.</p>
          </div>

          {/* Right: Follow Us, Language, Currency */}
          <div className='flex items-center gap-4 ml-auto'>
            {/* Follow Us */}
            <div className='hidden lg:flex items-center gap-3'>
              <span className='text-white/90 text-sm mr-1'>Follow us:</span>
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white/80 hover:text-white transition-colors duration-200'
                    aria-label={social.label}
                    title={social.label}
                  >
                    <Icon
                      className='w-4 h-4'
                      aria-hidden='true'
                    />
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className='hidden lg:block w-px h-4 bg-white/30'></div>

            {/* Language Selector */}
            <div className='relative'>
              <select
                value={selectedLang}
                onChange={e => setSelectedLang(e.target.value)}
                className='appearance-none bg-transparent text-white text-sm pr-6 pl-2 py-1 cursor-pointer focus:outline-none'
                aria-label='Select language'
              >
                {languages.map(lang => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className='bg-(--color-orange) text-white'
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
              <svg
                className='absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>

            {/* Currency Selector */}
            <div className='relative'>
              <select
                value={selectedCurrency}
                onChange={e => setSelectedCurrency(e.target.value)}
                className='appearance-none bg-transparent text-white text-sm pr-6 pl-2 py-1 cursor-pointer focus:outline-none'
                aria-label='Select currency'
              >
                {currencies.map(currency => (
                  <option
                    key={currency.code}
                    value={currency.code}
                    className='bg-(--color-orange) text-white'
                  >
                    {currency.code}
                  </option>
                ))}
              </select>
              <svg
                className='absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
