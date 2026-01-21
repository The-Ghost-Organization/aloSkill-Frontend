"use client";

const letters = ["A", "L", "O", "S", "K", "I", "L", "L"]; // You can customize this

const AloskillLoader = () => {
  return (
    <div className='flex items-center justify-center space-x-4'>
      {letters.map((letter, i) => (
        <div
          key={i}
          className='loader relative w-11 h-11 inline-block'
        >
          <svg
            viewBox='0 0 80 80'
            className='w-full h-full block'
          >
            <rect
              x='8'
              y='8'
              width='64'
              height='64'
              className='stroke-[var(--path)] fill-none stroke-[10px] stroke-linejoin-round stroke-linecap-round'
            ></rect>
            <text
              x='50%'
              y='60%'
              textAnchor='middle'
              fill='black'
              fontSize='24'
              fontWeight='bold'
            >
              {letter}
            </text>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default AloskillLoader;
