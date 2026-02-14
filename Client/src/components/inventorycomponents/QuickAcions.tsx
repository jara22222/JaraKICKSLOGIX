export default function QuickActions({ label, icon }:{label:any,icon:any}){
    return (<>
    <button className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-[#001F3F] hover:bg-white hover:shadow-sm transition-all group h-20">
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
  