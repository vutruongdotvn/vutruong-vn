export default function BackgroundGlow() {
  return (
    <>
      <div className="absolute w-[500px] h-[500px] bg-blue-200/30 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-200/30 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />
    </>
  );
}