import { Footprints } from "lucide-react";

export default function PosterHeader() {
  return (
    <>
      <div
        className={`relative z-10 transition-all duration-1000 transform "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <div className="flex items-center gap-4 group cursor-default">
          <div className="flex flex-col">
            <span className="text-3xl mb-2 flex font-black tracking-tighter gap-1 text-[#FFFFFF] uppercase italic leading-none">
              <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center text-kicks-blue shadow-lg shadow-kicks-yellow/20">
                <i className="text-[#001F3F] text-sm">
                  <Footprints />
                </i>
              </div>
              KicksLogix
            </span>
            <span className="text-[10px] tracking-[0.3em] font-bold text-[#FFD700] uppercase ml-1 opacity-80">
              Intelligence System
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
