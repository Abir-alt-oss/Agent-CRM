import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportButtons({ data, columns, filename, title }) {
  // ── Export PDF ────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFillColor(13, 15, 20);
    doc.rect(0, 0, 297, 297, "F");
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 18);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [columns.map((c) => c.header)],
      body: data.map((item) => columns.map((c) => c.value(item) || "—")),
      styles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: [226, 232, 240],
        fillColor: [21, 24, 32],
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [30, 34, 48],
      },
      tableLineColor: [42, 48, 69],
      tableLineWidth: 0.3,
    });

    doc.save(`${filename}.pdf`);
  };

  // ── Imprimer ──────────────────────────────────────────
  const handlePrint = () => {
    const rows = data
      .map(
        (item) =>
          `<tr>${columns.map((c) => `<td>${c.value(item) || "—"}</td>`).join("")}</tr>`,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #f97316; }
            p { color: #64748b; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f97316; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${data.length} enregistrements</p>
          <table>
            <thead>
              <tr>${columns.map((c) => `<th>${c.header}</th>`).join("")}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={exportPDF}
        title="Exporter PDF"
      >
        📄 PDF
      </button>
      <button
        className="btn btn-secondary btn-sm"
        onClick={handlePrint}
        title="Imprimer"
      >
        🖨️ Imprimer
      </button>
    </div>
  );
}

export default ExportButtons;
