export default function LargeChart() {
  return (
    <>
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
              Stock Flow Velocity
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inbound vs. Outbound Volume
            </p>
          </div>

          {/* DATE FILTER & LEGEND */}
          <div className="flex items-center gap-4">
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#001F3F] transition-colors cursor-pointer hover:bg-slate-100">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 hidden sm:flex">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#001F3F]"></div>{" "}
                Inbound
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>{" "}
                Outbound
              </div>
            </div>
          </div>
        </div>

        {/* Custom SVG Area Chart */}
        <div className="h-64 w-full relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none">
            {[100, 75, 50, 25, 0].map((val) => (
              <div
                key={val}
                className="w-full border-b border-slate-50 flex items-center"
              >
                <span className="absolute -left-0 -mt-4">{val}k</span>
              </div>
            ))}
          </div>

          <svg
            viewBox="0 0 100 40"
            className="w-full h-full overflow-visible drop-shadow-sm"
            preserveAspectRatio="none"
          >
            {/* Outbound Area (Yellow) */}
            <path
              d="M0,40 L0,30 C10,25 20,35 30,20 C40,10 50,25 60,15 C70,10 80,5 90,10 L100,5 L100,40 Z"
              fill="rgba(255, 215, 0, 0.15)"
              stroke="none"
            />
            <path
              d="M0,30 C10,25 20,35 30,20 C40,10 50,25 60,15 C70,10 80,5 90,10 L100,5"
              fill="none"
              stroke="#FFD700"
              strokeWidth="0.8"
            />

            {/* Inbound Area (Blue) */}
            <path
              d="M0,40 L0,25 C15,28 30,15 45,25 C60,35 75,20 90,25 L100,15 L100,40 Z"
              fill="rgba(0, 31, 63, 0.05)"
              stroke="none"
            />
            <path
              d="M0,25 C15,28 30,15 45,25 C60,35 75,20 90,25 L100,15"
              fill="none"
              stroke="#001F3F"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
