/**
 * Document Generation Service
 * Handles instant browser printing and PDF generation via html2canvas & jsPDF.
 */

export const documentService = {
  /**
   * Trigger native browser print dialog
   * Automatically formatted by the @media print CSS in globals.css
   */
  print() {
    if (typeof window !== "undefined") {
      window.print();
    }
  },

  /**
   * Capture an HTML element and download as a high-quality PDF
   * @param {string} elementId HTML element id (e.g. 'printable-document')
   * @param {string} filename Output PDF filename (e.g. 'Marksheet-ADM-001.pdf')
   * @param {object} options Optional custom dimensions or orientation
   */
  async downloadPdf(elementId, filename = "document.pdf", options = {}) {
    if (typeof window === "undefined") return;

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found for PDF export.`);
      }

      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Render canvas at 2x scale for crisp printable text
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Standard A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: options.orientation || "portrait",
        unit: "mm",
        format: options.format || "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // For ID card format
      if (options.isIdCard) {
        // CR-80 card dimensions: 85.6mm x 54mm (or reverse for vertical)
        const cardPdf = new jsPDF({
          orientation: options.isVertical ? "portrait" : "landscape",
          unit: "mm",
          format: options.isVertical ? [54, 85.6] : [85.6, 54],
        });
        const w = cardPdf.internal.pageSize.getWidth();
        const h = cardPdf.internal.pageSize.getHeight();
        cardPdf.addImage(imgData, "PNG", 0, 0, w, h);
        cardPdf.save(filename);
        return;
      }

      // Calculate aspect ratio fit for standard A4 page
      const imgWidth = pdfWidth - 20; // 10mm margins on left & right
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to print dialog if canvas rendering encounters an issue
      window.print();
    }
  },
};

export default documentService;
