import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PartnershipModal from "@/modules/landing/components/PartnershipModal";
import {
  Footprints,
  Warehouse,
  ScanLine,
  PackageCheck,
  Truck,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Phone,
  ChevronRight,
  MapPin,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════════ */

// GSAP-style cubic-bezier curves
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];

// Clip-reveal from below (like GSAP SplitText)
function RevealLine({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "110%", rotate: 3 }}
        animate={inView ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 3 }}
        transition={{ duration: 1, delay, ease: EASE_OUT_EXPO }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Fade + slide up
function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_QUART }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Horizontal scale line (like GSAP drawSVG)
function ScaleLine({ delay = 0 }: { delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, delay, ease: EASE_OUT_EXPO }}
      className="h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent origin-left"
    />
  );
}

// Seamless infinite marquee using CSS keyframes approach
function Marquee({
  children,
  reverse = false,
  duration = 30,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Magnetic hover effect wrapper
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const SERVICES = [
  { icon: Warehouse, label: "Smart Warehousing", num: "01" },
  { icon: ScanLine, label: "QR Operations", num: "02" },
  { icon: PackageCheck, label: "Value-Added Services", num: "03" },
  { icon: Truck, label: "Fulfillment & Dispatch", num: "04" },
  { icon: BarChart3, label: "Real-Time Analytics", num: "05" },
  { icon: ShieldCheck, label: "Role-Based Access", num: "06" },
];

const PROCESS_STEPS = [
  { num: "01", title: "Discovery Call", desc: "We listen. You share your warehouse challenges, volume, and goals. No pitch decks — just a real conversation." },
  { num: "02", title: "Custom Blueprint", desc: "We map your operations to our platform — bin layouts, roles, integrations, and scan workflows tailored to you." },
  { num: "03", title: "Deployment & Training", desc: "We spin up your environment, onboard your team, and go live. Typical setup: 5 business days." },
  { num: "04", title: "Ongoing Partnership", desc: "Dedicated support, system updates, and quarterly reviews. We grow as you grow." },
];

const SHOWCASE = [
  { title: "Super Admin", tags: ["God View", "Multi-Branch", "Audit Logs"], desc: "Complete visibility across every branch, manager, and supplier.", path: "/superadmin", gradient: "from-blue-600/40 to-indigo-900/40" },
  { title: "Inbound Portal", tags: ["QR Scan", "Auto Bin Assign", "Put-Away"], desc: "Accept shipments, auto-assign bins, print labels.", path: "/inbound", gradient: "from-emerald-600/40 to-teal-900/40" },
  { title: "Outbound Portal", tags: ["Mobile-First", "FIFO Swap", "Pick & Scan"], desc: "Scan-powered bin reassignment and pick fulfillment.", path: "/outbound", gradient: "from-orange-600/40 to-amber-900/40" },
  { title: "VAS Portal", tags: ["Receipt Scan", "Courier Info", "Label Print"], desc: "Quality checks, shipping label printing, dispatch.", path: "/vas", gradient: "from-violet-600/40 to-purple-900/40" },
];

const MARQUEE_WORDS = ["Smart Warehousing", "QR Operations", "FIFO Compliance", "Real-Time Analytics", "Multi-Branch", "Auto Bin Assign", "Role-Based Access"];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export default function LandingPage() {
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);

  // Nav scroll
  const { scrollY } = useScroll();
  const [navSolid, setNavSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setNavSolid(v > 80));

  // Intro loader
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame++;
      const progress = Math.min(100, Math.floor((frame / 60) * 100));
      setLoadPercent(progress);
      if (progress < 100) requestAnimationFrame(tick);
      else setTimeout(() => setIntroComplete(true), 400);
    };
    requestAnimationFrame(tick);
  }, []);

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], [0, 300]);
  const heroOp = useTransform(heroP, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroP, [0, 1], [1, 0.92]);

  // Services ref (no heavy parallax – keeps layout tight)
  const servicesRef = useRef(null);

  return (
    <>
      {/* ═══ INTRO LOADER ═══ */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[9999] bg-[#001F3F] flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")` }} />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[140px] sm:text-[200px] font-black text-white/[0.03] leading-none absolute select-none tabular-nums"
            >
              {String(loadPercent).padStart(2, "0")}
            </motion.p>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="relative z-10 flex flex-col items-center">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-2xl border border-[#FFD700]/20 flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center">
                  <Footprints className="size-5 text-[#001F3F]" />
                </div>
              </motion.div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Loading experience</p>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
              <motion.div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-300" style={{ width: `${loadPercent}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#001F3F] text-white overflow-x-hidden selection:bg-[#FFD700] selection:text-[#001F3F]">

        {/* ═══ NAVBAR ═══ */}
        <motion.nav
          initial={{ y: -100 }}
          animate={introComplete ? { y: 0 } : { y: -100 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${navSolid ? "bg-[#001F3F]/80 backdrop-blur-2xl border-b border-white/[0.06]" : "bg-transparent"}`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <Footprints className="size-4 text-[#001F3F]" />
              </div>
              <span className="font-black text-base uppercase italic tracking-tight">KicksLogix</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              {["Services", "Process", "Work", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#FFD700] transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-[#FFD700] hover:after:w-full after:transition-all after:duration-300">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors">Sign In</Link>
              <Magnetic>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPartnershipOpen(true)} className="bg-[#FFD700] text-[#001F3F] px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 transition-shadow">
                  Schedule Call <ArrowUpRight className="size-3.5" />
                </motion.button>
              </Magnetic>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-9 h-9 flex items-center justify-center text-white">
              {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE_OUT_QUART }} className="md:hidden bg-[#001F3F] border-t border-white/5 px-6 py-6 space-y-4">
                {["Services", "Process", "Work", "Contact"].map((item, i) => (
                  <motion.a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="block text-sm font-bold text-white/50 hover:text-white uppercase tracking-widest">{item}</motion.a>
                ))}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileMenu(false)} className="text-sm font-bold text-white/50">Sign In</Link>
                  <button onClick={() => { setPartnershipOpen(true); setMobileMenu(false); }} className="bg-[#FFD700] text-[#001F3F] py-3 rounded-full text-xs font-black uppercase tracking-wider">Schedule Call</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ═══ HERO ═══ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
          {/* Ambient gradient orb */}
          <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#FFD700]/[0.04] rounded-full blur-[120px]" />

          <motion.div style={{ y: heroY, opacity: heroOp, scale: heroScale }} className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-20 relative z-10">
            <motion.div initial={{ opacity: 0, width: 0 }} animate={introComplete ? { opacity: 1, width: "3rem" } : {}} transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT_EXPO }} className="h-px bg-[#FFD700] mb-8" />

            <motion.p initial={{ opacity: 0, y: 20 }} animate={introComplete ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.8, ease: EASE_OUT_QUART }} className="text-[11px] font-bold text-[#FFD700] uppercase tracking-[0.3em] mb-8">
              Enterprise Warehouse Management System
            </motion.p>

            <div className="mb-10 space-y-1">
              {["We build systems", "that move product,", "not paperwork."].map((line, i) => (
                <RevealLine key={i} delay={0.6 + i * 0.12}>
                  <h1 className="text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[0.92] uppercase tracking-tighter">
                    {i === 1 ? (
                      <>that move <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700]">product,</span></>
                    ) : (
                      line
                    )}
                  </h1>
                </RevealLine>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={introComplete ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.2, duration: 0.8, ease: EASE_OUT_QUART }} className="text-base sm:text-lg text-white/35 max-w-lg leading-relaxed mb-12 font-light">
              End-to-end inventory control, QR-powered operations, and real-time visibility — from supplier dock to customer doorstep.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={introComplete ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.4, duration: 0.8, ease: EASE_OUT_QUART }} className="flex flex-col sm:flex-row gap-4">
              <Magnetic>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPartnershipOpen(true)} className="bg-[#FFD700] text-[#001F3F] px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-yellow-500/20 transition-shadow duration-500">
                  Schedule Call <ArrowRight className="size-4" />
                </motion.button>
              </Magnetic>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setPartnershipOpen(true)} className="border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 flex items-center justify-center gap-2">
                Request Partnership
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll line */}
          <motion.div initial={{ opacity: 0 }} animate={introComplete ? { opacity: 1 } : {}} transition={{ delay: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] -rotate-0">Scroll</span>
            <motion.div animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-px h-8 bg-gradient-to-b from-[#FFD700] to-transparent origin-top" />
          </motion.div>
        </section>

        {/* ═══ MARQUEE 1 ═══ */}
        <div className="py-6 border-y border-white/[0.04] overflow-hidden">
          <Marquee duration={40}>
            <div className="flex shrink-0">
              {MARQUEE_WORDS.map((word, i) => (
                <span key={i} className="flex items-center gap-5 px-5 shrink-0">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,215,0,0.15)]">
                    {word}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FFD700]/30 shrink-0" />
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        {/* ═══ SERVICES ═══ */}
        <section id="services" ref={servicesRef} className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div className="lg:sticky lg:top-28">
                <FadeUp>
                  <p className="text-[11px] font-bold text-[#FFD700] uppercase tracking-[0.3em] mb-4">What We Do</p>
                </FadeUp>
                <RevealLine delay={0.1}>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.92]">We are</h2>
                </RevealLine>
                <RevealLine delay={0.2}>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.92]">Good at</h2>
                </RevealLine>
                <FadeUp delay={0.4}>
                  <p className="text-white/30 mt-6 leading-relaxed max-w-md text-sm font-light">A complete ecosystem of warehouse management tools designed for sneaker brands, distributors, and e-commerce businesses.</p>
                </FadeUp>
              </div>

              <div className="space-y-2">
                {SERVICES.map((s, i) => (
                  <FadeUp key={i} delay={i * 0.06}>
                    <motion.div
                      whileHover={{ x: 8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-colors duration-500 cursor-default group"
                    >
                      <span className="text-[10px] font-bold text-white/10 font-mono w-5 shrink-0 group-hover:text-[#FFD700]/40 transition-colors duration-500">{s.num}</span>
                      <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center group-hover:bg-[#FFD700]/10 transition-colors duration-500 shrink-0">
                        <s.icon className="size-[18px] text-white/20 group-hover:text-[#FFD700] transition-colors duration-500" />
                      </div>
                      <span className="text-sm font-bold tracking-tight flex-1">{s.label}</span>
                      <ArrowUpRight className="size-3.5 text-white/[0.06] group-hover:text-[#FFD700]/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500" />
                    </motion.div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ScaleLine />

        {/* ═══ PROCESS ═══ */}
        <section id="process" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="max-w-2xl mb-14">
              <FadeUp>
                <p className="text-[11px] font-bold text-[#FFD700] uppercase tracking-[0.3em] mb-4">Our Process</p>
              </FadeUp>
              <RevealLine>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.92]">We believe in a</h2>
              </RevealLine>
              <RevealLine delay={0.1}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.92]">
                  process <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700]">that works</span>
                </h2>
              </RevealLine>
              <FadeUp delay={0.3}>
                <p className="text-white/30 mt-6 leading-relaxed text-sm font-light max-w-lg">
                  If you have an idea, a warehouse challenge, or even just a rough direction in mind — we'd truly love to hear it. A simple conversation is all it takes.
                </p>
              </FadeUp>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROCESS_STEPS.map((step, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="border border-white/[0.04] rounded-2xl p-6 h-full group hover:border-[#FFD700]/15 transition-colors duration-500 relative overflow-hidden"
                  >
                    <span className="text-6xl font-black text-white/[0.03] group-hover:text-[#FFD700]/[0.07] transition-colors duration-500 block mb-5 leading-none absolute top-4 right-4">
                      {step.num}
                    </span>
                    <div className="relative">
                      <div className="w-8 h-px bg-[#FFD700]/30 mb-5 group-hover:w-12 transition-all duration-500" />
                      <h3 className="text-base font-bold mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-sm text-white/25 leading-relaxed font-light">{step.desc}</p>
                    </div>
                  </motion.div>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={0.4} className="mt-14 flex justify-center">
              <Magnetic>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPartnershipOpen(true)} className="bg-[#FFD700] text-[#001F3F] px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:shadow-2xl hover:shadow-yellow-500/20 transition-shadow duration-500">
                  Schedule Call <ArrowRight className="size-4" />
                </motion.button>
              </Magnetic>
            </FadeUp>
          </div>
        </section>

        {/* ═══ MARQUEE 2 ═══ */}
        <div className="py-6 border-y border-white/[0.04] overflow-hidden">
          <Marquee reverse duration={45}>
            <div className="flex shrink-0">
              {["Design with purpose", "Code with passion", "Create with vision", "Innovate always", "Ship with confidence"].map((word, i) => (
                <span key={i} className="flex items-center gap-5 px-5 shrink-0">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,215,0,0.15)]">
                    {word}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FFD700]/30 shrink-0" />
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        {/* ═══ FEATURED WORK ═══ */}
        <section id="work" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <FadeUp><p className="text-[11px] font-bold text-[#FFD700] uppercase tracking-[0.3em] mb-4">Featured Work</p></FadeUp>
                <RevealLine><h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.92]">Built Different</h2></RevealLine>
              </div>
              <FadeUp delay={0.2}>
                <p className="text-white/30 text-sm max-w-md leading-relaxed font-light">Each portal is purpose-built for its role — from the god-view admin to mobile-first scanners on the warehouse floor.</p>
              </FadeUp>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {SHOWCASE.map((item, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500 cursor-pointer h-full"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                      <div className="relative p-8 sm:p-10 flex flex-col min-h-[260px] sm:min-h-[300px]">
                        <div className="flex flex-wrap gap-2 mb-auto">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-white/30 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.04] group-hover:text-white/60 group-hover:border-white/10 transition-colors duration-500">{tag}</span>
                          ))}
                        </div>
                        <div className="mt-8">
                          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                            {item.title}
                            <ArrowUpRight className="size-5 text-white/10 group-hover:text-[#FFD700] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                          </h3>
                          <p className="text-sm text-white/20 leading-relaxed max-w-sm font-light group-hover:text-white/40 transition-colors duration-500">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        <ScaleLine />

        {/* ═══ CTA ═══ */}
        <section id="contact" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] p-10 sm:p-16 lg:p-20">
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.03, 0.08, 0.03] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />

              <div className="relative max-w-2xl">
                <FadeUp><p className="text-[11px] font-bold text-[#FFD700] uppercase tracking-[0.3em] mb-8">Let's Build Together</p></FadeUp>
                <RevealLine><h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.92]">Every great partnership</h2></RevealLine>
                <RevealLine delay={0.1}><h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.92]">started with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-amber-300 to-[#FFD700]">curiosity</span></h2></RevealLine>
                <FadeUp delay={0.3}><p className="text-white/30 mt-8 mb-12 text-sm leading-relaxed max-w-lg font-light">Have a warehouse challenge? You don't need all the answers yet. A focused conversation is often enough. Reach out and let's see what we can build together.</p></FadeUp>
                <FadeUp delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Magnetic>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPartnershipOpen(true)} className="bg-[#FFD700] text-[#001F3F] px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-yellow-500/20 transition-shadow duration-500">
                        <Phone className="size-4" /> Schedule a Call <ArrowRight className="size-4" />
                      </motion.button>
                    </Magnetic>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setPartnershipOpen(true)} className="border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white/[0.03] hover:border-white/20 transition-all duration-500 flex items-center justify-center gap-2">
                      Make It Real <ArrowUpRight className="size-4" />
                    </motion.button>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center">
                    <Footprints className="size-5 text-[#001F3F]" />
                  </div>
                  <span className="font-black text-xl uppercase italic tracking-tight">KicksLogix</span>
                </div>
                <p className="text-sm text-white/25 leading-relaxed mb-6 max-w-xs font-light">The enterprise WMS built for sneaker brands, distributors, and e-commerce businesses that ship at scale.</p>
                <div className="flex items-center gap-3">
                  {["Fb", "In", "Tw", "Ig"].map((s) => (
                    <div key={s} className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-[10px] font-bold text-white/25 hover:bg-[#FFD700]/10 hover:text-[#FFD700] hover:border-[#FFD700]/20 transition-all duration-500 cursor-pointer">{s}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/15 mb-5">Platform</h4>
                <ul className="space-y-3">
                  {["Smart Warehousing", "QR Scan Operations", "Value-Added Services", "Fulfillment & Dispatch", "Real-Time Analytics", "Role-Based Access"].map((item) => (
                    <li key={item}><a href="#services" className="text-sm text-white/25 hover:text-[#FFD700] transition-colors duration-300 flex items-center gap-2 group font-light"><ChevronRight className="size-3 text-white/10 group-hover:text-[#FFD700] transition-colors duration-300" />{item}</a></li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/15 mb-5">Company</h4>
                <ul className="space-y-3">
                  {[{ label: "About", href: "#services" }, { label: "Process", href: "#process" }, { label: "Work", href: "#work" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }].map((item) => (
                    <li key={item.label}><a href={item.href} className="text-sm text-white/25 hover:text-[#FFD700] transition-colors duration-300 flex items-center gap-2 group font-light"><ChevronRight className="size-3 text-white/10 group-hover:text-[#FFD700] transition-colors duration-300" />{item.label}</a></li>
                  ))}
                  <li><Link to="/login" className="text-sm text-white/25 hover:text-[#FFD700] transition-colors duration-300 flex items-center gap-2 group font-light"><ChevronRight className="size-3 text-white/10 group-hover:text-[#FFD700] transition-colors duration-300" />Sign In</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/15 mb-5">Get in Touch</h4>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 mt-0.5"><Phone className="size-3.5 text-[#FFD700]" /></div>
                    <div><p className="text-[10px] text-white/15 uppercase font-bold tracking-wider">Phone</p><p className="text-sm text-white/35 font-light">+63 2 8888 KICK</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 mt-0.5"><MapPin className="size-3.5 text-[#FFD700]" /></div>
                    <div><p className="text-[10px] text-white/15 uppercase font-bold tracking-wider">HQ</p><p className="text-sm text-white/35 font-light">BGC, Taguig<br />Metro Manila 1630</p></div>
                  </div>
                </div>
                <Magnetic>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPartnershipOpen(true)} className="w-full bg-[#FFD700] text-[#001F3F] py-3 rounded-full font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/20 transition-shadow duration-500">
                    <Phone className="size-3.5" /> Request a Call
                  </motion.button>
                </Magnetic>
              </div>
            </div>

            <div className="border-t border-white/[0.04]" />
            <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-white/15">&copy; {new Date().getFullYear()} KicksLogix WMS. All rights reserved.</p>
              <div className="flex items-center gap-6 text-[11px] text-white/15">
                <a href="#" className="hover:text-white/30 transition-colors duration-300">Privacy</a>
                <a href="#" className="hover:text-white/30 transition-colors duration-300">Terms</a>
                <a href="#" className="hover:text-white/30 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <PartnershipModal isOpen={partnershipOpen} onClose={() => setPartnershipOpen(false)} />
    </>
  );
}
