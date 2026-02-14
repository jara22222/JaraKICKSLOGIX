import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages =
    totalPages <= 5
      ? pages
      : pages.filter(
          (p) =>
            p === 1 ||
            p === totalPages ||
            (p >= currentPage - 1 && p <= currentPage + 1)
        );

  return (
    <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">
          Showing{" "}
          <span className="font-bold text-slate-600">
            {startItem}–{endItem}
          </span>{" "}
          of <span className="font-bold text-slate-600">{totalItems}</span>{" "}
          records
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            Rows:
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded px-1.5 py-1 text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer bg-white"
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>

        {visiblePages.map((page, idx) => {
          const prevPage = visiblePages[idx - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <div key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  currentPage === page
                    ? "bg-[#001F3F] text-white"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#001F3F]"
                }`}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
