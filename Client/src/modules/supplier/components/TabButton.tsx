export default function TabButton({
  label,
  isActive,
  onClick,
  count,
}: {
  label: any;
  isActive: any;
  onClick: () => void;
  count: any;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className={`pb-4 text-sm font-bold tracking-wide uppercase transition-all relative whitespace-nowrap ${isActive ? "text-[#001F3F]" : "text-slate-400 hover:text-slate-600"}`}
      >
        {label}
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-[#001F3F] text-white" : "bg-slate-200 text-slate-500"}`}
        >
          {count}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFD700] rounded-t-full"></div>
        )}
      </button>
    </>
  );
}
