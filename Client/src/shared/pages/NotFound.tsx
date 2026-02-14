import { motion } from "framer-motion";
import { Footprints, Home, ArrowLeft, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#001F3F] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl"
      />

      <div className="relative text-center max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
            <Footprints className="size-7 text-[#001F3F]" />
          </div>
        </motion.div>

        {/* Big 404 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-6"
        >
          {/* Shadow 404 behind */}
          <span className="absolute inset-0 text-[160px] sm:text-[200px] font-black text-white/[0.03] leading-none select-none flex items-center justify-center">
            404
          </span>

          <div className="relative flex items-center justify-center gap-3 sm:gap-4">
            {/* Animated digits */}
            {["4", "0", "4"].map((digit, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.7,
                  delay: 0.3 + i * 0.12,
                }}
                className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-none"
              >
                {digit}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="w-16 h-0.5 bg-[#FFD700] mx-auto mb-6 origin-center"
        />

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
            Looks like this page got lost in the warehouse. The route you're
            looking for doesn't exist or has been moved to a different bin
            location.
          </p>
        </motion.div>

        {/* Animated search icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{
              x: [0, 12, -8, 16, 0],
              y: [0, -6, 4, -10, 0],
              rotate: [0, 10, -5, 15, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <Search className="size-7 text-slate-500" />
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3.5 border-2 border-white/15 text-white rounded-2xl font-bold text-sm uppercase tracking-wider backdrop-blur-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </motion.button>
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-[#FFD700] text-[#001F3F] rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
              <Home className="size-4" />
              Back to Home
            </motion.div>
          </Link>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-10 pt-8 border-t border-white/5"
        >
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
            Maybe you were looking for
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Dashboard", path: "/accesscontroll" },
              { label: "Super Admin", path: "/superadmin" },
              { label: "Inbound", path: "/inbound" },
              { label: "Outbound", path: "/outbound" },
              { label: "VAS Portal", path: "/vas" },
              { label: "Sign In", path: "/login" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-[#FFD700] hover:border-[#FFD700]/30 hover:bg-[#FFD700]/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
