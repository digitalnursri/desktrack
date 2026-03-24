import React, { useState } from 'react';
import { FileBarChart, Filter, Search, DownloadCloud, Activity, Users, Clock, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const Reports = () => {
  const { selectedDate } = useAuth();
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const [reportData] = useState([]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1 font-display tracking-tight">Analytics & Reports</h2>
          <p className="text-slate-500 font-medium text-sm">Generate, view, and export data insights.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group flex items-center bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all cursor-pointer">
            <CalendarIcon size={16} className="text-primary-500 mr-2" />
            <span className="text-slate-700 text-sm">{formattedDate}</span>
          </div>
          <Button className="gap-2 shadow-lg h-[42px]">
            <FileBarChart size={18} /> Generate New Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="flex flex-col justify-between">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mb-4 w-fit"><Activity size={20} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Reports Generated</p>
          <p className="text-3xl font-bold text-slate-900 font-display">0</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mb-4 w-fit"><Users size={20} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">HR & People Metrics</p>
          <p className="text-3xl font-bold text-slate-900 font-display">0</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 mb-4 w-fit"><Clock size={20} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Time & Attendance</p>
          <p className="text-3xl font-bold text-slate-900 font-display">0</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mb-4 w-fit"><CheckCircle size={20} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Financial Data</p>
          <p className="text-3xl font-bold text-slate-900 font-display">0</p>
        </Card>
      </div>

      <Card noPadding className="shadow-premium">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="w-full sm:max-w-md">
            <Input icon={Search} placeholder="Search reports by title or ID..." className="bg-slate-50 border-slate-200" />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <Filter size={16} /> <span className="hidden sm:inline">Category</span>
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          {reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No archived reports found.</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Report Name</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Category</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Date Generated</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Author</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Size</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-primary-600 transition-colors">{record.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{record.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="bg-slate-100 font-medium">{record.type}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 text-sm">{record.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{record.author}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{record.size}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg flex items-center justify-center ml-auto gap-2 transition-colors font-bold text-xs border border-primary-200 hover:bg-primary-100">
                        <DownloadCloud size={16} /> Get PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
