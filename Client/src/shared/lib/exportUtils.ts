import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import QRCode from "qrcode";

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

    showSuccessToast("CSV export completed.");
  } catch {
    showErrorToast("Failed to export CSV.");
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
    showSuccessToast("PDF export completed.");
  } catch {
    showErrorToast("Failed to export PDF.");
  }
}

export async function exportBinQRCodesToPDF(
  filename: string,
  bins: Array<{
    binId: string;
    binLocation: string;
    binSize: string;
    qrCodeString: string;
  }>,
) {
  try {
    if (!bins.length) {
      showErrorToast("No bin QR codes found to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let cursorX = 12;
    let cursorY = 20;
    const cardWidth = 58;
    const cardHeight = 82;
    const qrSize = 40;
    const gapX = 8;
    const gapY = 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KICKSLOGIX BIN QR SHEET", 12, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated: ${formatDateTime()}`, pageWidth - 12, 12, {
      align: "right",
    });

    for (let index = 0; index < bins.length; index++) {
      const bin = bins[index];
      const qrImage = await QRCode.toDataURL(bin.qrCodeString, { width: 260, margin: 1 });

      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(cursorX, cursorY, cardWidth, cardHeight, 2, 2);
      doc.addImage(qrImage, "PNG", cursorX + 9, cursorY + 8, qrSize, qrSize);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(bin.binLocation, cursorX + cardWidth / 2, cursorY + 56, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(`${bin.binSize} • ${bin.binId}`, cursorX + cardWidth / 2, cursorY + 61, {
        align: "center",
      });
      doc.text(bin.qrCodeString, cursorX + cardWidth / 2, cursorY + 67, {
        align: "center",
        maxWidth: cardWidth - 6,
      });

      cursorX += cardWidth + gapX;
      if (cursorX + cardWidth > pageWidth) {
        cursorX = 12;
        cursorY += cardHeight + gapY;
      }

      if (cursorY + cardHeight > pageHeight && index < bins.length - 1) {
        doc.addPage();
        cursorX = 12;
        cursorY = 20;
      }
    }

    doc.save(`${filename}_${formatDateForFile()}.pdf`);
    showSuccessToast("Bin QR PDF exported successfully.");
  } catch {
    showErrorToast("Failed to export bin QR PDF.");
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
