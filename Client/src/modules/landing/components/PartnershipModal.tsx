import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Building2,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Footprints,
} from "lucide-react";
import { useState } from "react";

type PartnershipModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormMode = "form" | "success";

export default function PartnershipModal({
  isOpen,
  onClose,
}: PartnershipModalProps) {
  const [mode, setMode] = useState<FormMode>("form");
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    partnershipType: "warehousing",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app: send to API
    setMode("success");
  };

  const handleClose = () => {
    setMode("form");
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      partnershipType: "warehousing",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#001F3F] px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFD700] rounded-lg flex items-center justify-center">
                  <Footprints className="size-5 text-[#001F3F]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">
                    {mode === "success"
                      ? "Request Submitted!"
                      : "Schedule Partnership"}
                  </h2>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                    KicksLogix WMS
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {mode === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5"
                >
                  <CheckCircle2 className="size-10 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-black text-[#001F3F] mb-2">
                  We'll Be in Touch!
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
                  Thank you for your interest in partnering with KicksLogix. Our
                  team will contact you within 24 hours to schedule your
                  partnership consultation.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 w-full mb-6">
                  <p className="text-xs font-bold text-blue-700 flex items-center justify-center gap-2">
                    <Phone className="size-4" />
                    Expect a call from our partnerships team
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#001F3F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00162e] transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto flex-1 p-6 space-y-4"
              >
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  Fill in your details and we'll call you to discuss a
                  partnership. No subscriptions — just a conversation.
                </p>

                {/* Partnership Type */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Partnership Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "warehousing", label: "Warehousing" },
                      { key: "fulfillment", label: "Fulfillment" },
                      { key: "distribution", label: "Distribution" },
                      { key: "custom", label: "Custom Solution" },
                    ].map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            partnershipType: type.key,
                          })
                        }
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                          formData.partnershipType === type.key
                            ? "border-[#001F3F] bg-[#001F3F] text-white"
                            : "border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company & Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        placeholder="Acme Corp"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Contact Person
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@acme.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+63 917 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Date/Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="date"
                        required
                        value={formData.preferredDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredDate: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 size-4 text-slate-300" />
                      <input
                        type="time"
                        required
                        value={formData.preferredTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredTime: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Message (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 size-4 text-slate-300" />
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about your warehousing needs..."
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#FFD700] text-[#001F3F] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="size-4" />
                  Request Partnership Call
                </motion.button>

                <p className="text-[10px] text-slate-400 text-center">
                  No spam. No subscriptions. We'll call you at the scheduled
                  time to discuss partnership opportunities.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
