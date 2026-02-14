import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import { UseGetBinState } from "@/modules/bin-management/store/UseGetBins";
import {
  PackageCheck,
  X,
  Warehouse,
  MapPin,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";

export default function AcceptShipmentModal() {
  const { acceptTarget, setAcceptTarget, acceptShipment } = useInboundStore();
  const bins = UseGetBinState((b) => b.NEW_INITIAL_BINS);

  // Auto-find the best available bin
  const suggestedBin = useMemo(() => {
    if (!acceptTarget) return null;

    // Find bins that are Active and have available capacity
    const available = bins
      .filter(
        (bin) =>
          bin.status === "Active" && bin.current + acceptTarget.qty <= bin.capacity
      )
      .sort((a, b) => b.capacity - b.current - (a.capacity - a.current)); // Most free space first

    if (available.length > 0) return available[0];

    // If no bin has enough capacity for full qty, find any with partial space
    const partialAvailable = bins
      .filter(
        (bin) => bin.status === "Active" && bin.current < bin.capacity
      )
      .sort((a, b) => b.capacity - b.current - (a.capacity - a.current));

    return partialAvailable.length > 0 ? partialAvailable[0] : null;
  }, [acceptTarget, bins]);

  if (!acceptTarget) return null;

  const isOverflow = suggestedBin
    ? acceptTarget.qty > suggestedBin.capacity - suggestedBin.current
    : true;

  const handleAccept = () => {
    const binCode = suggestedBin ? suggestedBin.code : "STAGING-01";
    acceptShipment(acceptTarget.id, binCode);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={() => setAcceptTarget(null)}
      ></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <PackageCheck className="size-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#001F3F]">
                Accept Shipment
              </h3>
              <p className="text-xs text-slate-400">
                {acceptTarget.id} &middot; {acceptTarget.poRef}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAcceptTarget(null)}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {/* Shipment details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-sm font-bold text-[#001F3F]">
                {acceptTarget.supplier.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#001F3F]">
                  {acceptTarget.product}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {acceptTarget.sku} &middot; {acceptTarget.supplier}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                <p className="text-lg font-black text-[#001F3F]">
                  {acceptTarget.qty.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Units
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-600">
                  {acceptTarget.dateSent}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Sent
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-600">
                  {acceptTarget.eta}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  ETA
                </p>
              </div>
            </div>
          </div>

          {/* Auto-assigned bin */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Warehouse className="size-4" />
              System Auto-Assigned Bin
            </p>
            {suggestedBin ? (
              <div
                className={`p-4 rounded-xl border-2 ${
                  isOverflow
                    ? "bg-amber-50 border-amber-300"
                    : "bg-emerald-50 border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOverflow
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="font-mono text-lg font-black text-[#001F3F]">
                        {suggestedBin.code}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        {suggestedBin.zone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {suggestedBin.current}/{suggestedBin.capacity}
                      </span>
                      <ArrowRight className="size-3 text-slate-400" />
                      <span className="text-xs font-bold text-[#001F3F]">
                        {suggestedBin.current + acceptTarget.qty}/
                        {suggestedBin.capacity}
                      </span>
                    </div>
                    <div className="w-24 h-2 bg-white rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isOverflow ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(((suggestedBin.current + acceptTarget.qty) / suggestedBin.capacity) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-3">
                <AlertTriangle className="size-5 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-red-700">
                    No available bin found
                  </p>
                  <p className="text-xs text-red-500">
                    Items will be assigned to staging area STAGING-01
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Overflow warning */}
          {isOverflow && suggestedBin && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Partial fit:</strong> The selected bin does not have
                enough capacity for all {acceptTarget.qty} units. Overflow items
                may need to be split across multiple bins.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={() => setAcceptTarget(null)}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <PackageCheck className="size-3.5" />
            Accept & Assign to Bin
          </button>
        </div>
      </div>
    </div>
  );
}
