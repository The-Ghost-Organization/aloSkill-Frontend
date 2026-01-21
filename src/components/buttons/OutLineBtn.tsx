import { Send } from "lucide-react";

const OutLineBtn = () => {
  return (
    <button className='w-full sm:w-auto relative inline-flex h-14 active:scale-95 transition overflow-hidden rounded-full p-[2px] focus:outline-none'>
      <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#DA7C36_0%,#f472b6_50%,#bd5fff_100%)]'></span>
      <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-gray-900 backdrop-blur-3xl gap-2 hover:bg-[var(--color-orange)] hover:text-white transition-colors'>
        Become Instructor
        <Send className='w-4 h-4' />
      </span>
    </button>
  );
};

export default OutLineBtn;
