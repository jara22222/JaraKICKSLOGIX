type QuickActionsProps = {
  label: string;
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function QuickActions({
  label,
  icon,
  onClick,
  disabled = false,
}: QuickActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-[#001F3F] hover:bg-white hover:shadow-sm transition-all group h-20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i
          className={`fa-solid ${icon} text-[#001F3F] text-lg mb-2 group-hover:scale-110 transition-transform`}
        ></i>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide group-hover:text-[#001F3F]">
          {label}
        </span>
      </button>
    </>
  );
}
