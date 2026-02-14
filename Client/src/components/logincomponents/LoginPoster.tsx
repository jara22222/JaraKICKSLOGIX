import PosetBody from "./PosterBody";
import PosterHeader from "./PosterHeader";


export default function LoginPoster() {
  return (
    <>
      <PosterHeader />
      <PosetBody />
      <div className="relative z-10 flex justify-between items-center text-[10px] font-bold tracking-widest text-white/30 uppercase italic">
        <span>Global Node: Manila_South_01</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          System Secure
        </span>
      </div>
    </>
  );
}
