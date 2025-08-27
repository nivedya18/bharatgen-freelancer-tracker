import React, { useState } from 'react';
import { FreelancerTask } from '../lib/supabase';
import { InvoiceData } from '../types';
import { FileText, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface InvoiceGeneratorProps {
  tasks: FreelancerTask[];
  freelancers: string[];
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ tasks, freelancers }) => {
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const generateInvoice = () => {
    if (!selectedFreelancer || !dateRange.start || !dateRange.end) return;

    const filteredTasks = tasks.filter(task => 
      task.freelancer_name === selectedFreelancer &&
      task.start_date >= dateRange.start &&
      task.completion_date <= dateRange.end
    );

    if (filteredTasks.length === 0) {
      alert('No tasks found for the selected freelancer and date range.');
      return;
    }

    const invoiceTasks = filteredTasks.map(task => ({
      task: task.task,
      model: task.model,
      language: task.language,
      start_date: task.start_date,
      completion_date: task.completion_date,
      pay_rate_per_day: task.pay_rate_per_day,
      total_time_taken: task.total_time_taken,
      total_payment: task.pay_rate_per_day * task.total_time_taken,
    }));

    const totalAmount = invoiceTasks.reduce((sum, task) => sum + task.total_payment, 0);

    setInvoiceData({
      freelancer_name: selectedFreelancer,
      tasks: invoiceTasks,
      total_amount: totalAmount,
      date_range: dateRange,
    });
  };

  const downloadPDF = () => {
    if (!invoiceData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Invoice details
    pdf.setFontSize(12);
    pdf.text(`Invoice Date: ${format(new Date(), 'dd/MM/yyyy')}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Period: ${format(new Date(invoiceData.date_range.start), 'dd/MM/yyyy')} - ${format(new Date(invoiceData.date_range.end), 'dd/MM/yyyy')}`, 20, yPosition);
    yPosition += 20;

    // Freelancer details
    pdf.setFontSize(14);
    pdf.text('Bill To:', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(invoiceData.freelancer_name, 20, yPosition);
    yPosition += 20;

    // Table header
    pdf.setFontSize(10);
    const headers = ['Task', 'Model', 'Language', 'Days', 'Rate/Day', 'Amount'];
    const colWidths = [40, 30, 25, 15, 25, 25];
    let xPosition = 20;

    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 5;

    // Draw line
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Table rows
    invoiceData.tasks.forEach(task => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      xPosition = 20;
      const rowData = [
        task.task.substring(0, 20) + (task.task.length > 20 ? '...' : ''),
        task.model.substring(0, 15) + (task.model.length > 15 ? '...' : ''),
        task.language.substring(0, 12) + (task.language.length > 12 ? '...' : ''),
        task.total_time_taken.toString(),
        `₹${task.pay_rate_per_day.toLocaleString('en-IN')}`,
        `₹${task.total_payment.toLocaleString('en-IN')}`,
      ];

      rowData.forEach((data, index) => {
        pdf.text(data, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 8;
    });

    // Total
    yPosition += 10;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Total Amount: ₹${invoiceData.total_amount.toLocaleString('en-IN')}`, pageWidth - 80, yPosition, { align: 'right' });

    pdf.save(`invoice-${invoiceData.freelancer_name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const printInvoice = () => {
    if (!invoiceData) return;
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Invoice Generator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Freelancer
          </label>
          <select
            value={selectedFreelancer}
            onChange={(e) => setSelectedFreelancer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Freelancer</option>
            {freelancers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={generateInvoice}
        disabled={!selectedFreelancer || !dateRange.start || !dateRange.end}
        className="w-full mb-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Generate Invoice
      </button>

      {invoiceData && (
        <div className="border border-gray-200 rounded-lg p-6 print:shadow-none">
          <div className="flex justify-between items-start mb-6 print:mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-gray-600">Date: {format(new Date(), 'dd/MM/yyyy')}</p>
              <p className="text-gray-600">
                Period: {format(new Date(invoiceData.date_range.start), 'dd/MM/yyyy')} - {format(new Date(invoiceData.date_range.end), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={printInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
            <p className="text-gray-700">{invoiceData.freelancer_name}</p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Task</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Model</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Language</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Start Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">End Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Days</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Rate/Day</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{task.task}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.model}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.language}</td>
                    <td className="border border-gray-300 px-4 py-2">{format(new Date(task.start_date), 'dd/MM/yyyy')}</td>
                    <td className="border border-gray-300 px-4 py-2">{format(new Date(task.completion_date), 'dd/MM/yyyy')}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{task.total_time_taken}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{task.pay_rate_per_day.toLocaleString('en-IN')}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{task.total_payment.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">
                Total Amount: ₹{invoiceData.total_amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};