import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// ─── CSV EXPORT ──────────────────────────────────
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: string[][]
) {
  try {
    const escape = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${formatDateForFile()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV export completed.");
  } catch {
    toast.error("Failed to export CSV.");
  }
}

// ─── PDF EXPORT ──────────────────────────────────
export function exportToPDF(
  filename: string,
  title: string,
  headers: string[],
  rows: string[][],
  options?: {
    orientation?: "portrait" | "landscape";
    subtitle?: string;
  }
) {
  try {
    const doc = new jsPDF({
      orientation: options?.orientation || "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(0, 31, 63); // #001F3F
    doc.rect(0, 0, pageWidth, 28, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("KICKSLOGIX", 14, 12);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Warehouse Management System", 14, 18);

    // Report title on the right
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth - 14, 12, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 215, 0); // #FFD700
    doc.text(`Generated: ${formatDateTime()}`, pageWidth - 14, 18, {
      align: "right",
    });

    if (options?.subtitle) {
      doc.setTextColor(200, 200, 200);
      doc.text(options.subtitle, pageWidth - 14, 23, { align: "right" });
    }
    // Table
    autoTable(doc, {
      startY: 34,
      head: [headers],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [0, 31, 63],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      bodyStyles: {
        textColor: [30, 41, 59],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 8,
          { align: "right" }
        );
        doc.text(
          "KicksLogix — Confidential",
          14,
          doc.internal.pageSize.getHeight() - 8
        );
      },
    });

    doc.save(`${filename}_${formatDateForFile()}.pdf`);
    toast.success("PDF export completed.");
  } catch {
    toast.error("Failed to export PDF.");
  }
}

// ─── HELPERS ─────────────────────────────────────
function formatDateForFile(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(): string {
  return new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
