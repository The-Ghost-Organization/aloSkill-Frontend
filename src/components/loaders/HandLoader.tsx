"use client";

const HandLoader = () => {
  return (
    <div className='relative w-20 h-16 ml-20'>
      {/* Shadow */}
      <div className='absolute top-[70%] right-[20%] w-[180%] h-[75%] bg-black/30 rounded-[40px_10px] blur-md'></div>

      {/* Palm */}
      <div className='absolute inset-0 bg-[#E4C560] rounded-[10px_40px]'></div>

      {/* Thumb */}
      <div
        className='absolute w-[120%] h-[38px] bg-[#E4C560] bottom-[-18%] right-[1%] rounded-[30px_20px_20px_10px] border-b border-l border-black/10'
        style={{
          transformOrigin: "calc(100% - 20px) 20px",
          transform: "rotate(-20deg)",
        }}
      >
        <div className='absolute w-[20%] h-[60%] bg-white/30 bottom-[-8%] left-[5px] rounded-[60%_10%_10%_30%] border-r border-black/5'></div>
      </div>

      {/* Fingers */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className='absolute w-[80%] h-[35px] bg-[#E4C560] bottom-[32%] right-[64%] rounded-[20px]'
          style={{
            transformOrigin: "100% 20px",
            animation: `tap-${i + 1} 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            filter: `brightness(${70 + i * 10}%)`,
          }}
        >
          <div
            className='absolute w-[140%] h-[30px] bg-[#E4C560] rounded-[20px] bottom-[8%] right-[65%]'
            style={{
              transformOrigin: "calc(100% - 20px) 20px",
              transform: "rotate(-60deg)",
            }}
          ></div>
        </div>
      ))}

      {/* Keyframes */}
      <style jsx>{`
        @keyframes tap-1 {
          0%,
          50%,
          100% {
            transform: rotate(10deg) scale(0.4);
          }
          40% {
            transform: rotate(50deg) scale(0.4);
          }
        }
        @keyframes tap-2 {
          0%,
          50%,
          100% {
            transform: rotate(10deg) scale(0.6);
          }
          40% {
            transform: rotate(50deg) scale(0.6);
          }
        }
        @keyframes tap-3 {
          0%,
          50%,
          100% {
            transform: rotate(10deg) scale(0.8);
          }
          40% {
            transform: rotate(50deg) scale(0.8);
          }
        }
        @keyframes tap-4 {
          0%,
          50%,
          100% {
            transform: rotate(10deg) scale(1);
          }
          40% {
            transform: rotate(50deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HandLoader;
