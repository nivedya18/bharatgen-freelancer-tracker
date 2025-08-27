import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from '../types';
import { TrendingUp, IndianRupee } from 'lucide-react';

interface ExpenditureChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'pie';
}

const COLORS = [
  '#05539C', // BharatGen Blue
  '#F59222', // BharatGen Orange
  '#0567C4', // Light Blue
  '#FFAB47', // Light Orange
  '#033A6B', // Dark Blue
  '#D67A0C', // Dark Orange
  '#3B82F6', // Sky Blue
  '#FCD34D', // Yellow
  '#10B981', // Emerald
  '#8B5CF6', // Violet
];

export const ExpenditureChart: React.FC<ExpenditureChartProps> = ({ data, title, type }) => {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border rounded-lg shadow-xl" style={{borderColor: 'rgba(245, 146, 34, 0.3)'}}>
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="font-medium flex items-center gap-1" style={{color: '#05539C'}}>
              <IndianRupee className="w-3 h-3" />
              {formatCurrency(payload[0].value).replace('₹', '')}
            </p>
            <p className="text-gray-500 text-sm">
              {payload[0].payload.percentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border rounded-lg shadow-xl" style={{borderColor: 'rgba(245, 146, 34, 0.3)'}}>
          <p className="font-semibold text-gray-900 mb-2">{payload[0].name}</p>
          <div className="space-y-1">
            <p className="font-medium flex items-center gap-1" style={{color: '#05539C'}}>
              <IndianRupee className="w-3 h-3" />
              {formatCurrency(payload[0].value).replace('₹', '')}
            </p>
            <p className="text-gray-500 text-sm">
              {payload[0].payload.percentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" style={{color: '#F59222'}} />
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p>No data available for the selected filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{color: '#F59222'}} />
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500">
          {data.length} {data.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 1 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#05539C" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F59222" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 146, 34, 0.1)' }} />
              <Bar 
                dataKey="value" 
                fill="url(#colorGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg p-3" style={{background: 'linear-gradient(to right, rgba(5, 83, 156, 0.1), rgba(5, 83, 156, 0.15))'}}>
          <p className="text-xs text-gray-600 mb-1">Total Items</p>
          <p className="text-lg font-bold text-gray-900">{data.length}</p>
        </div>
        <div className="rounded-lg p-3" style={{background: 'linear-gradient(to right, rgba(245, 146, 34, 0.1), rgba(245, 146, 34, 0.15))'}}>
          <p className="text-xs text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
          </p>
        </div>
        <div className="rounded-lg p-3" style={{background: 'linear-gradient(to right, rgba(5, 83, 156, 0.05), rgba(245, 146, 34, 0.1))'}}>
          <p className="text-xs text-gray-600 mb-1">Highest</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(Math.max(...data.map(item => item.value)))}
          </p>
        </div>
        <div className="rounded-lg p-3" style={{background: 'linear-gradient(to right, rgba(245, 146, 34, 0.05), rgba(5, 83, 156, 0.1))'}}>
          <p className="text-xs text-gray-600 mb-1">Average</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  );
};