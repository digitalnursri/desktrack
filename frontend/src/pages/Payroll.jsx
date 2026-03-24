import React, { useState } from 'react';
import { DollarSign, Download, Filter, Search, TrendingUp, CreditCard, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const Payroll = () => {
  const { selectedDate } = useAuth();
  const currentMonth = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [payrollData] = useState([]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1 font-display tracking-tight">Payroll & Salary</h2>
          <p className="text-slate-500 font-medium text-sm">Manage employee compensation, bonuses, and slips.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group flex items-center bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all cursor-pointer">
            <CalendarIcon size={16} className="text-primary-500 mr-2" />
            <span className="text-slate-700 text-sm">{currentMonth}</span>
          </div>
          <Button className="gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 h-[42px]">
            <DollarSign size={18} /> Run Payroll
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Output</p>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><TrendingUp size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 font-display">$0</p>
          <p className="text-xs font-semibold text-emerald-600 mt-2">No disbursements yet</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Taxes & Deductions</p>
            <div className="p-2 rounded-lg bg-alert-100 text-alert-600"><DollarSign size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 font-display">$0</p>
          <p className="text-xs font-semibold text-slate-400 mt-2">{currentMonth} cycle</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Disbursement Date</p>
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600"><CreditCard size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display mt-1">-</p>
          <p className="text-xs font-semibold text-primary-600 mt-2">Next auto-pay schedule</p>
        </Card>
      </div>

      <Card noPadding className="shadow-premium">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="w-full sm:max-w-md">
            <Input icon={Search} placeholder="Search employee payroll..." className="bg-slate-50 border-slate-200" />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <Filter size={16} /> <span className="hidden sm:inline">Filter Records</span>
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          {payrollData.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No payroll records found for this month.</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap min-w-[900px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Employee Details</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Month</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Basic Pay</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-success-600">Bonus</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-alert-600">Deductions</th>
                  <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-100">Net Salary</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{record.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{record.role}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 text-sm">{record.month}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{record.basic}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-success-600">{record.bonus}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-alert-600">-{record.deduction}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-lg">{record.net}</td>
                    <td className="px-6 py-4">
                      <Badge variant={record.status === 'Paid' ? 'success' : record.status === 'Processing' ? 'primary' : 'warning'}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors" title="Download Payslip">
                        <Download size={18} />
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

export default Payroll;
