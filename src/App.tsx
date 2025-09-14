import { useState, useEffect, useCallback } from 'react';
import { TaskForm } from './components/TaskForm';
import { FilterPanel } from './components/FilterPanel';
import { TaskTable } from './components/TaskTable';
import { ExpenditureChart } from './components/ExpenditureChart';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { useFreelancerTasks } from './hooks/useFreelancerTasks';
import { FilterState, ChartData } from './types';
import { exportToExcel } from './utils/excelExport';
import { BarChart3, FileText, FileSpreadsheet } from 'lucide-react';

const initialFilters: FilterState = {
  dateRange: { start: '', end: '' },
  freelancer_name: [],
  language: [],
  model: [],
  freelancer_type: '',
  task_status: '',
  search: '',
};

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'invoice'>('form');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { tasks, loading, fetchTasks, updateTask, deleteTask, getUniqueValues } = useFreelancerTasks();

  // Combined effect for fetching data
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'invoice') {
      fetchTasks(filters);
    }
  }, [activeTab, filters, fetchTasks]);

  const handleExportExcel = () => {
    exportToExcel(tasks, 'freelancer-tasks');
  };

  const getLanguageExpenditureData = useCallback((): ChartData[] => {
    const languageMap = new Map<string, number>();
    
    tasks.forEach(task => {
      const amount = task.pay_rate_per_day * task.total_time_taken;
      languageMap.set(task.language, (languageMap.get(task.language) || 0) + amount);
    });

    const total = Array.from(languageMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(languageMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [tasks]);

  const getModelExpenditureData = useCallback((): ChartData[] => {
    const modelMap = new Map<string, number>();
    
    tasks.forEach(task => {
      const amount = task.pay_rate_per_day * task.total_time_taken;
      modelMap.set(task.model, (modelMap.get(task.model) || 0) + amount);
    });

    const total = Array.from(modelMap.values()).reduce((sum, value) => sum + value, 0);
    
    return Array.from(modelMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [tasks]);

  const tabs = [
    { id: 'form', label: 'Add Task', icon: FileText },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'invoice', label: 'Invoice', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src="/BharatGen Logo.png" 
                alt="BharatGen - GenAI for Bharat, by Bharat" 
                className="h-10 w-auto object-contain"
              />
              <div className="border-l border-gray-300 h-8"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Freelancer Task Management
              </h1>
            </div>
            
            <nav className="flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'form' | 'dashboard' | 'invoice')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' ? (
          <TaskForm />
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Filter Panel - Always visible */}
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  </div>
                </>
              ) : (
                <>
                  <ExpenditureChart
                    data={getLanguageExpenditureData()}
                    title="Language-wise Expenditure"
                    type="bar"
                  />
                  <ExpenditureChart
                    data={getModelExpenditureData()}
                    title="Model-wise Expenditure"
                    type="pie"
                  />
                </>
              )}
            </div>
            
            {/* Table Section */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <TaskTable 
                tasks={tasks} 
                onExportExcel={handleExportExcel}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
          </div>
        ) : (
          // Invoice Tab
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <InvoiceGenerator
                tasks={tasks}
                freelancers={getUniqueValues('freelancer_name')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;