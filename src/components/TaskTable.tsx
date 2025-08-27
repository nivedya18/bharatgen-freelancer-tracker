import React, { useState } from 'react';
import { FreelancerTask, FreelancerTaskInsert } from '../lib/supabase';
import { ChevronUp, ChevronDown, Download, Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import { EditTaskModal } from './EditTaskModal';

interface TaskTableProps {
  tasks: FreelancerTask[];
  onExportExcel: () => void;
  onUpdateTask?: (id: string, updates: Partial<FreelancerTaskInsert>) => Promise<any>;
  onDeleteTask?: (id: string) => Promise<any>;
}

type SortField = keyof FreelancerTask | 'total_payment';
type SortDirection = 'asc' | 'desc';

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onExportExcel, onUpdateTask, onDeleteTask }) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState<FreelancerTask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'total_payment') {
      aValue = a.pay_rate_per_day * a.total_time_taken;
      bValue = b.pay_rate_per_day * b.total_time_taken;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yy');
  };

  const handleDelete = async (taskId: string) => {
    if (!onDeleteTask) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await onDeleteTask(taskId);
      if (!result.success) {
        alert('Failed to delete task');
      }
    }
  };

  const handleEdit = (task: FreelancerTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async (id: string, updates: Partial<FreelancerTaskInsert>) => {
    if (!onUpdateTask) return { success: false, error: 'Update function not provided' };
    
    const result = await onUpdateTask(id, updates);
    if (result.success) {
      setShowEditModal(false);
      setEditingTask(null);
    }
    return result;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Tasks ({tasks.length} total)
        </h3>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('freelancer_name')}
              >
                <div className="flex items-center gap-1">
                  Freelancer
                  <SortIcon field="freelancer_name" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('task')}
              >
                <div className="flex items-center gap-1">
                  Task
                  <SortIcon field="task" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('model')}
              >
                <div className="flex items-center gap-1">
                  Model
                  <SortIcon field="model" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('language')}
              >
                <div className="flex items-center gap-1">
                  Language
                  <SortIcon field="language" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('freelancer_type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  <SortIcon field="freelancer_type" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pay_rate_per_day')}
              >
                <div className="flex items-center gap-1">
                  Rate/Day
                  <SortIcon field="pay_rate_per_day" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_time_taken')}
              >
                <div className="flex items-center gap-1">
                  Days
                  <SortIcon field="total_time_taken" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('start_date')}
              >
                <div className="flex items-center gap-1">
                  Period
                  <SortIcon field="start_date" />
                </div>
              </th>
              <th 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_payment')}
              >
                <div className="flex items-center gap-1">
                  Total Payment
                  <SortIcon field="total_payment" />
                </div>
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.freelancer_name}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.task}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.model}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.language}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    task.freelancer_type === 'Linguist' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {task.freelancer_type}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(task.pay_rate_per_day)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.total_time_taken}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(task.start_date)} - {formatDate(task.completion_date)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(task.pay_rate_per_day * task.total_time_taken)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1 rounded hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, tasks.length)} of {tasks.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
};