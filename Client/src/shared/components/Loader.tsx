import { motion } from "framer-motion";
import { Footprints } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#001F3F] flex flex-col items-center justify-center">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Pulsing glow behind logo */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-40 h-40 bg-[#FFD700] rounded-full blur-3xl"
      />

      {/* Logo Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative mb-8"
      >
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-[3px] border-transparent border-t-[#FFD700] border-r-[#FFD700]/30"
        />

        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30"
          >
            <Footprints className="size-7 text-[#001F3F]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tight mb-1">
          KicksLogix
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          Warehouse Management System
        </p>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-1.5 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-[#FFD700]"
          />
        ))}
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
}
