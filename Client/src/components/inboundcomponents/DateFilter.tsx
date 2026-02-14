export default function DateFilter() {
  return (
    <>
      <div className="flex items-center bg-white border border-slate-200 h-12  rounded-lg p-1 gap-2">
        <div className="flex items-center px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
            From:
          </span>
          <input
            type="date"
            className="text-xs text-slate-600 font-medium focus:outline-none"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
            To:
          </span>
          <input
            type="date"
            className="text-xs text-slate-600 font-medium focus:outline-none"
          />
        </div>
      </div>
    </>
  );
}
