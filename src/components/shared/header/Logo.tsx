// import Image from "next/image";
// import Link from "next/link";

// const Logo = () => {
//   return (
//     <Link
//       href="/"
//       aria-label="Aloskill Home"
//       className="flex items-center gap-2 select-none"
//     >
//       <Image
//         src="/logo.png"      // place this inside /public
//         alt="Aloskill Logo"
//         width={120}
//         height={40}
//         priority
//         className="h-8 w-auto"
//       />
//     </Link>
//   );
// };

// export default Logo;

import Link from "next/link";

const Logo = () => {
  return (
    <Link
      href='/'
      className='flex items-center gap-2 cursor-pointer select-none'
    >
      <span className='text-xl font-bold text-gray-900 hidden sm:block'>
        আলো <span style={{ color: "var(--color-orange)" }}>স্কিল</span>
      </span>
    </Link>
  );
};

export default Logo;
