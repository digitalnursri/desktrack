import React, { useState } from 'react';
import { Calendar, Filter, Plus, Clock, Search, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const getStatusBadge = (status) => {
  switch(status) {
    case 'Approved': return <Badge variant="success">Approved</Badge>;
    case 'Pending': return <Badge variant="warning">Pending</Badge>;
    case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const Leaves = () => {
  const { selectedDate, setSelectedDate } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // 10 Dummy Data Records
  const [leaveRequests, setLeaveRequests] = useState([]);
  const counts = {
    pending: leaveRequests.filter(r => r.status === 'Pending').length,
    approved: leaveRequests.filter(r => r.status === 'Approved').length,
    rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1 font-display tracking-tight">Leave Management</h2>
          <p className="text-slate-500 font-medium text-sm">Review, approve, and track employee time off.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group flex items-center bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all cursor-pointer">
            <CalendarIcon size={16} className="text-primary-500 mr-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none text-slate-700 cursor-pointer text-sm"
              style={{ colorScheme: 'light' }}
            />
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 self-start sm:self-auto h-[42px] shadow-lg">
            <Plus size={18} /> Apply strictly Leave
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <div className="p-2 rounded-lg bg-warning-100 text-warning-600"><Clock size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 font-display">{counts.pending}</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Approved</p>
            <div className="p-2 rounded-lg bg-success-100 text-success-600"><CheckCircle size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 font-display">{counts.approved}</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
            <div className="p-2 rounded-lg bg-alert-100 text-alert-600"><XCircle size={18} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 font-display">{counts.rejected}</p>
        </Card>
        <Card className="flex flex-col justify-between bg-primary-600 text-white border-primary-500 shadow-premium">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-bold text-primary-100 uppercase tracking-wider">Company Policy</p>
            <div className="p-2 rounded-lg bg-primary-500 text-white"><Calendar size={18} /></div>
          </div>
          <div>
            <p className="text-xl font-bold font-display leading-tight">21 Days</p>
            <p className="text-xs text-primary-200 mt-1">Standard Annual Allowance</p>
          </div>
        </Card>
      </div>

      <Card noPadding className="shadow-premium">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="w-full sm:max-w-md">
            <Input icon={Search} placeholder="Search requests by name..." className="bg-slate-50 border-slate-200" />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <Filter size={16} /> <span className="hidden sm:inline">Filter Status</span>
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Employee</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Leave Type</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Duration</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Days</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Reason</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 text-sm">
                    {record.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(record.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-700 text-sm">{record.days} Day(s)</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{record.reason}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status === 'Pending' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-xs font-bold text-success-600 hover:bg-success-50 px-3 py-1.5 rounded transition-colors border border-success-200 bg-white">Approve</button>
                        <button className="text-xs font-bold text-alert-600 hover:bg-alert-50 px-3 py-1.5 rounded transition-colors border border-alert-200 bg-white">Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply strictly Leave">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
          <div>
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5 block">Leave Type</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800">
              <option>Sick Leave</option>
              <option>Annual Leave</option>
              <option>Casual Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5 block">Start Date</label>
              <Input type="date" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5 block">End Date</label>
              <Input type="date" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5 block">Reason for Leave</label>
            <textarea 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800 resize-none h-24"
              placeholder="Please provide a brief reason..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
