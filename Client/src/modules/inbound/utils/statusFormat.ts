export const formatInboundStatus = (status: string): string => {
  const normalized = status.replace(/[_-]+/g, "").toUpperCase();
  const knownStatuses: Record<string, string> = {
    PENDINGPUTAWAY: "Pending Put-away",
    CLAIMEDFORPUTAWAY: "Claimed for Put-away",
    ITEMSCANNED: "Item Scanned",
    STORED: "Stored",
    INTRANSIT: "In Transit",
    ARRIVED: "Arrived",
    ACCEPTED: "Accepted",
  };

  if (knownStatuses[normalized]) return knownStatuses[normalized];

  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getInboundStatusBadgeClass = (status: string): string => {
  const normalized = status.replace(/[_-]+/g, "").toUpperCase();
  if (normalized === "STORED" || normalized === "ARRIVED" || normalized === "ACCEPTED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (normalized === "ITEMSCANNED" || normalized === "INTRANSIT") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (normalized === "CLAIMEDFORPUTAWAY") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};
