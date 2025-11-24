import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_COLOR = [200, 163, 95];
const SECONDARY_COLOR = [10, 61, 44];

export interface PDFColumn {
  header: string;
  dataKey: string;
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  columns: PDFColumn[];
  data: any[];
  fileName: string;
  summary?: Array<{ label: string; value: string }>;
}

const loadLogoImage = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = '/bullfinance-removebg-preview.png';
  });
};

export const generatePDF = async (options: PDFOptions) => {
  const { title, subtitle, columns, data, fileName, summary } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  doc.setFillColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  try {
    const logoData = await loadLogoImage();
    const logoWidth = 40;
    const logoHeight = 30;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoData, 'PNG', logoX, 8, logoWidth, logoHeight);
  } catch (error) {
    console.error('Error loading logo:', error);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BULL FINANCE', pageWidth / 2, 20, { align: 'center' });
  }

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Sistema de Gestão Financeira', pageWidth / 2, 40, { align: 'center' });

  yPosition = 55;

  doc.setTextColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, yPosition);
  yPosition += 6;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, yPosition);
    yPosition += 8;
  } else {
    yPosition += 2;
  }

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Gerado em: ${currentDate}`, 14, yPosition);
  yPosition += 10;

  if (summary && summary.length > 0) {
    doc.setFillColor(248, 250, 252);
    const summaryHeight = summary.length * 8 + 8;
    doc.rect(14, yPosition, pageWidth - 28, summaryHeight, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);

    let summaryY = yPosition + 6;
    summary.forEach((item) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(item.label, 18, summaryY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.text(item.value, pageWidth - 18, summaryY, { align: 'right' });

      summaryY += 8;
    });

    yPosition += summaryHeight + 8;
  }

  autoTable(doc, {
    startY: yPosition,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey] || '-')),
    theme: 'striped',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 35 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

      const footerY = pageHeight - 25;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');

      doc.text('Sistema idealizado por Vanessa Dias', pageWidth / 2, footerY, {
        align: 'center',
      });

      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.text('https://www.linkedin.com/in/vanessaazuos/', pageWidth / 2, footerY + 3.5, {
        align: 'center',
      });

      doc.setTextColor(100, 100, 100);
      doc.text('e desenvolvido por Andressa Mirian', pageWidth / 2, footerY + 7, {
        align: 'center',
      });

      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.text('https://www.linkedin.com/in/andressamirian/', pageWidth / 2, footerY + 10.5, {
        align: 'center',
      });

      doc.setTextColor(100, 100, 100);
      doc.text('no ano de 2025. Todos os direitos reservados.', pageWidth / 2, footerY + 14, {
        align: 'center',
      });

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - 14, footerY, {
        align: 'right',
      });
    },
  });

  doc.save(fileName);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};
