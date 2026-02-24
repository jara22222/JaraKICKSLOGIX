import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  QrCode,
  Ruler,
  Package,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { getPublicBinLocationById } from "@/modules/bin-management/services/binLocation";

export default function BinLocation() {
  const { id } = useParams();

  const {
    data: bin,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-bin-location", id],
    queryFn: () => getPublicBinLocationById(id ?? ""),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-sm text-slate-500">
          Loading bin details...
        </div>
      </div>
    );
  }

  if (isError || !bin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-red-700">Bin not found</p>
          <p className="text-xs text-red-500 mt-1">
            The QR code may be invalid or this bin was archived.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-[#001F3F] rounded-2xl p-5 text-white shadow-lg">
          <p className="text-[10px] tracking-[0.2em] uppercase text-slate-300 font-bold">
            Bin Location Details
          </p>
          <h1 className="text-2xl font-black mt-1">{bin.binLocation}</h1>
          <p className="text-xs text-slate-300 mt-1">Scanned QR reference</p>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Bin Location
              </p>
              <p className="text-sm font-bold text-[#001F3F]">{bin.binLocation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Ruler className="size-3.5" /> Size
              </p>
              <p className="text-sm font-bold text-[#001F3F] mt-1">{bin.binSize}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Package className="size-3.5" /> Capacity
              </p>
              <p className="text-sm font-bold text-[#001F3F] mt-1">
                {bin.binCapacity}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Status
            </p>
            <p className="text-sm font-bold text-[#001F3F] mt-1">{bin.binStatus}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <QrCode className="size-3.5" /> Bin ID
            </p>
            <p className="text-xs font-mono text-[#001F3F] mt-1 break-all">
              {bin.binId}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Clock3 className="size-3.5" /> Updated
            </p>
            <p className="text-xs text-[#001F3F] mt-1">
              {new Date(bin.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
