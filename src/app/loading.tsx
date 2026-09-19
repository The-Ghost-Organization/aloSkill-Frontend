import AloskillLoader from "@/components/loaders/AloskillLoder.tsx";

const loading = () => {
  return (
    <div className='mx-auto flex h-screen w-full items-center justify-center'>
      {/* <HandLoader /> */}
      <AloskillLoader />
    </div>
  );
};

export default loading;
