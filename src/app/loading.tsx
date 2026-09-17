import HandLoader from "@/components/loaders/HandLoader.tsx";

const loading = () => {
  return (
    <div className='mx-auto flex h-screen w-full items-center justify-center'>
      <HandLoader />
    </div>
  );
};

export default loading;
