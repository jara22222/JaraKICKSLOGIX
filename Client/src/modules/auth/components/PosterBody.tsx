export default function PosetBody() {
  return (
    <>
      <div
        className={`relative z-10 max-w-lg transition-all duration-1000 delay-300 transform "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
      >
        <h2 className="text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
          Precision <br />
          <span className="text-[#FFD700]">In Every Step.</span>
        </h2>
        <p className="text-blue-100/70 text-xl font-light leading-relaxed mb-12">
          The global standard for high-end footwear distribution. Integrated
          FIFO logic, real-time telemetry, and secure verification.
        </p>

        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
          <div>
            <p className="text-[#FFD700] font-bold text-2xl mb-1">99.9%</p>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
              Inventory Accuracy
            </p>
          </div>
          <div>
            <p className="text-[#FFD700] font-bold text-2xl mb-1">2.4s</p>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
              Processing Speed
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
