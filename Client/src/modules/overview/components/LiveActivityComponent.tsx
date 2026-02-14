import { UseActivityFeed } from "@/modules/overview/store/UseActivityFeed";
export default function LiveActivityComponent() {
  const ACTIVITY_FEED = UseActivityFeed((feed) => feed.activityFeed);
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide flex items-center gap-2">
            <i className="fa-solid fa-bolt text-slate-400"></i> Live Stream
          </h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="p-4 space-y-5">
          {ACTIVITY_FEED.map((feed, idx) => (
            <div key={idx} className="flex gap-3 relative">
              {/* Timeline Connector */}
              {idx !== ACTIVITY_FEED.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-slate-100"></div>
              )}

              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 z-10">
                {feed.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold text-[#001F3F]">
                    {feed.user}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {feed.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {feed.action}{" "}
                  <span className="text-slate-400">• {feed.role}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
