import React, { useState, useMemo } from 'react';
import { FreelancerTask } from '../lib/supabase';
import { InvoiceData } from '../types';
import { Combobox, ComboboxOption } from './Combobox';
import { FileText, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { InvoicePDFGenerator } from '../utils/invoicePdf';

interface InvoiceGeneratorProps {
  tasks: FreelancerTask[];
  freelancers: string[];
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ tasks, freelancers }) => {
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Convert freelancer strings to ComboboxOptions
  const freelancerOptions: ComboboxOption[] = useMemo(() => 
    freelancers.map(name => ({ 
      value: name, 
      label: name 
    })),
    [freelancers]
  );

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
      task_group: task.task_group || undefined,
      task: task.task_description,
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
    
    const pdfGenerator = new InvoicePDFGenerator();
    pdfGenerator.generate(invoiceData);
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
          <Combobox
            options={freelancerOptions}
            value={selectedFreelancer}
            onChange={setSelectedFreelancer}
            searchPlaceholder="Search freelancer..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
            style={{"--tw-ring-color": "rgba(5, 83, 156, 0.5)"} as React.CSSProperties}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
            style={{"--tw-ring-color": "rgba(5, 83, 156, 0.5)"} as React.CSSProperties}
          />
        </div>
      </div>

      <button
        onClick={generateInvoice}
        disabled={!selectedFreelancer || !dateRange.start || !dateRange.end}
        className="w-full mb-6 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{backgroundColor: '#05539C', "--tw-ring-color": "rgba(245, 146, 34, 0.5)"} as React.CSSProperties}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0567C4'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#05539C'}
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
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
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