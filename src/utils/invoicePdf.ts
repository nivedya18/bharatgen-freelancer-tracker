import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { InvoiceData } from '../types';

// Company configuration - can be moved to environment variables or config file
const COMPANY_CONFIG = {
  name: 'BharatGen',
  tagline: 'Language Solutions',
  address: '',
  email: '',
  phone: '',
  gstin: '',
  pan: '',
  bankDetails: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    branch: ''
  }
};

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export class InvoicePDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private invoiceNumber: string;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.margin = 20;
    this.currentY = this.margin;
    this.invoiceNumber = this.generateInvoiceNumber();
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  }

  private addHeader(): void {
    // Company Name and Logo Area
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(5, 83, 156); // BharatGen Blue
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(COMPANY_CONFIG.name, this.margin, this.currentY);
    
    // Tagline
    if (COMPANY_CONFIG.tagline) {
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(COMPANY_CONFIG.tagline, this.margin, this.currentY + 6);
    }

    // Invoice Title
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('INVOICE', this.pageWidth - this.margin, this.currentY, { align: 'right' });

    this.currentY += 15;

    // Add a decorative line
    this.pdf.setDrawColor(5, 83, 156);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 10;
  }

  private addInvoiceDetails(invoiceData: InvoiceData): void {
    const leftColumnX = this.margin;
    const rightColumnX = this.pageWidth / 2 + 10;

    // Left side - Bill To
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(5, 83, 156);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('BILL TO:', leftColumnX, this.currentY);
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(invoiceData.freelancer_name, leftColumnX, this.currentY + 6);
    
    // Right side - Invoice Details
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFont('helvetica', 'normal');
    
    const invoiceDetails = [
      ['Invoice No:', this.invoiceNumber],
      ['Invoice Date:', format(new Date(), 'dd MMM yyyy')],
      ['Period:', `${format(new Date(invoiceData.date_range.start), 'dd MMM yyyy')} - ${format(new Date(invoiceData.date_range.end), 'dd MMM yyyy')}`]
    ];

    let detailY = this.currentY;
    invoiceDetails.forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(label, rightColumnX, detailY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(value, rightColumnX + 25, detailY);
      detailY += 5;
    });

    this.currentY = Math.max(this.currentY + 15, detailY + 5);
  }

  private addTasksTable(invoiceData: InvoiceData): void {
    const tableData = invoiceData.tasks.map((task, index) => [
      (index + 1).toString(),
      task.task,
      task.model,
      task.language,
      format(new Date(task.start_date), 'dd/MM/yy'),
      format(new Date(task.completion_date), 'dd/MM/yy'),
      task.total_time_taken.toFixed(2),
      `₹${task.pay_rate_per_day.toLocaleString('en-IN')}`,
      `₹${task.total_payment.toLocaleString('en-IN')}`
    ]);

    // Table data prepared
    
    autoTable(this.pdf, {
      startY: this.currentY,
      head: [['#', 'Task Description', 'Model', 'Language', 'Start', 'End', 'Days', 'Rate/Day', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [5, 83, 156],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'right', cellWidth: 22 },
        8: { halign: 'right', cellWidth: 25, fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: this.margin, right: this.margin },
      didDrawPage: () => {
        // Add page number at the bottom
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(150);
        this.pdf.text(
          `Page ${this.pdf.getCurrentPageInfo().pageNumber}`,
          this.pageWidth / 2,
          this.pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    this.currentY = this.pdf.lastAutoTable.finalY + 10;
  }

  private addSummary(invoiceData: InvoiceData): void {
    const summaryX = this.pageWidth - this.margin - 60;
    
    // Summary box background
    this.pdf.setFillColor(245, 247, 250);
    this.pdf.rect(summaryX - 5, this.currentY - 5, 65, 35, 'F');
    
    // Summary details
    const summaryItems = [
      ['Subtotal:', `₹${invoiceData.total_amount.toLocaleString('en-IN')}`],
      ['GST (18%):', `₹${(invoiceData.total_amount * 0.18).toLocaleString('en-IN')}`],
    ];

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    
    let summaryY = this.currentY;
    summaryItems.forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(label, summaryX, summaryY);
      this.pdf.text(value, summaryX + 55, summaryY, { align: 'right' });
      summaryY += 6;
    });

    // Total line
    this.pdf.setDrawColor(5, 83, 156);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(summaryX, summaryY, summaryX + 55, summaryY);
    summaryY += 6;

    // Grand Total
    const grandTotal = invoiceData.total_amount * 1.18; // Including GST
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(5, 83, 156);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TOTAL:', summaryX, summaryY);
    this.pdf.text(`₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, summaryX + 55, summaryY, { align: 'right' });

    this.currentY = summaryY + 15;
  }

  private addPaymentDetails(): void {
    if (!COMPANY_CONFIG.bankDetails.bankName) return;

    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(5, 83, 156);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PAYMENT DETAILS:', this.margin, this.currentY);
    
    this.currentY += 7;
    
    const paymentDetails = [
      ['Bank Name:', COMPANY_CONFIG.bankDetails.bankName],
      ['Account Name:', COMPANY_CONFIG.bankDetails.accountName],
      ['Account Number:', COMPANY_CONFIG.bankDetails.accountNumber],
      ['IFSC Code:', COMPANY_CONFIG.bankDetails.ifscCode],
      ['Branch:', COMPANY_CONFIG.bankDetails.branch]
    ].filter(([_, value]) => value);

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    paymentDetails.forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(label, this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(value, this.margin + 30, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 10;
  }

  private addFooter(): void {
    // Terms and conditions
    const termsY = this.pageHeight - 40;
    
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    this.pdf.setFont('helvetica', 'normal');
    
    const terms = [
      'Terms & Conditions:',
      '1. Payment is due within 30 days from the invoice date.',
      '2. Please include the invoice number in your payment reference.',
      '3. For any queries, please contact us at the details provided above.'
    ];

    let lineY = termsY;
    terms.forEach((term, index) => {
      if (index === 0) {
        this.pdf.setFont('helvetica', 'bold');
      } else {
        this.pdf.setFont('helvetica', 'normal');
      }
      this.pdf.text(term, this.margin, lineY);
      lineY += 4;
    });

    // Footer line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.1);
    this.pdf.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);

    // Footer text
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    this.pdf.text(
      'Thank you for your business!',
      this.pageWidth / 2,
      this.pageHeight - 15,
      { align: 'center' }
    );

    // Company info in footer
    if (COMPANY_CONFIG.email || COMPANY_CONFIG.phone) {
      const contactInfo = [COMPANY_CONFIG.email, COMPANY_CONFIG.phone].filter(Boolean).join(' | ');
      this.pdf.text(
        contactInfo,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  public generate(invoiceData: InvoiceData): void {
    this.addHeader();
    this.addInvoiceDetails(invoiceData);
    this.addTasksTable(invoiceData);
    this.addSummary(invoiceData);
    this.addPaymentDetails();
    this.addFooter();

    // Save the PDF
    const filename = `invoice-${invoiceData.freelancer_name.replace(/\s+/g, '-')}-${this.invoiceNumber}.pdf`;
    this.pdf.save(filename);
  }

  public getBlob(): Blob {
    return this.pdf.output('blob');
  }

  public getDataUri(): string {
    return this.pdf.output('datauristring');
  }
}