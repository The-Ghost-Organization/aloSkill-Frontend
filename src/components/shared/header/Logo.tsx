import Image from "next/image";
import Link from "next/link";
import logo from "../../../../public/images/aloskill-logo.jpg";
const Logo = () => {
  return (
    <Link
      href={"/"}
      aria-label='Go to homepage'
      className={"flex items-center gap-2 select-none"}
    >
      <Image
        src={logo}
        alt='Aloskill logo'
        priority
        className='w-24 md:w-32 lg:w-48 h-auto object-contain'
        sizes='(max-width: 768px) 128px, 192px'
      />
    </Link>
  );
};

export default Logo;
