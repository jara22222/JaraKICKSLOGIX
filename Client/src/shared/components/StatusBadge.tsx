import { Box } from "lucide-react";

export default function StatusBadge({
  status,
  current,
  capacity,
}: {
  status: any;
  current?: any;
  capacity?: any;
}) {
  const isFull = current >= capacity;
  let text = status;
  if (isFull && status !== "Maintenance") {
    text = "Full";
  } else if (current === 0) {
    text = "Empty";
  }
  let styles = "bg-green-50 text-green-700 border-green-200";
  if (
    status === "Pending Approval" ||
    status === "Review" ||
    status === "Occupied" ||
    status === "Flagged"
  )
    styles = "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "In Transit")
    styles = "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
      {status === "Active" && isFull && <Box size={10} />}
      {text}
    </span>
  );
}
