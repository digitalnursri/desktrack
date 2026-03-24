import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, UserX, AlertCircle, Edit, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import DynamicForm from '../components/forms/DynamicForm';
import api from '../services/api';
import { motion } from 'framer-motion';

const EmployeeManagement = () => {
  const { selectedDate, setSelectedDate } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [fields, setFields] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, fieldRes] = await Promise.all([
          api.get('/employees').catch(() => ({ data: [] })),
          api.get('/custom-fields?module=employees').catch(() => ({ data: [] }))
        ]);
        
        setEmployees(empRes.data);
        setFields(fieldRes.data || []);
      } catch (err) {
        console.error('Fetch Data Error:', err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Artificial delay to show beautiful skeleton
      }
    };
    fetchData();
  }, []);

  const handleAddEmployee = async (values) => {
    setIsSubmitting(true);
    try {
      await api.post('/employees', values);
      // Refresh list
      const empRes = await api.get('/employees');
      setEmployees(empRes.data);
      setShowAddModal(false);
    } catch (err) {
      console.error('Add Employee Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE': return <Badge variant="success">Active</Badge>;
      case 'INACTIVE': return <Badge variant="warning">Inactive</Badge>;
      case 'RESIGNED': return <Badge variant="danger">Resigned</Badge>;
      default: return <Badge>{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1 font-display tracking-tight">Employee Directory</h2>
          <p className="text-slate-500 font-medium text-sm">Manage, update, and track your workforce data.</p>
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
          <Button onClick={() => setShowAddModal(true)} className="gap-2 self-start sm:self-auto h-[42px]">
            <Plus size={18} />
            Add Employee
          </Button>
        </div>
      </header>

      <Card noPadding className="shadow-premium">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="w-full sm:max-w-md">
            <Input 
              icon={Search} 
              placeholder="Search by name, email, or role..." 
              className="bg-slate-50 border-slate-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
               Export CSV
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : employees.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <UserX size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-1">No Employees Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">You haven't added any employees yet, or no employees match your search criteria.</p>
              <Button onClick={() => setShowAddModal(true)}>Add Your First Employee</Button>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Employee Details</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Role & Dept</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Assigned Shift</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100">Joined</th>
                  <th className="px-6 py-4 font-bold text-slate-600 uppercase text-xs tracking-wider border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={emp.id} 
                    className="hover:bg-primary-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 border-l-4 border-transparent group-hover:border-primary-500 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors ring-1 ring-slate-200 group-hover:ring-primary-200">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{emp.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{emp.designation_name || 'Unassigned'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{emp.department_name || 'No Department'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-primary-500" />
                        <span>{emp.shift_name || 'Not Configured'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(emp.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-alert-600 hover:bg-alert-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && employees.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-4">
            <p className="font-medium">Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">{employees.length}</span> of <span className="font-bold text-slate-900">{employees.length}</span> results</p>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" disabled>Previous</Button>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Register New Employee"
      >
        <div className="mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-3 text-sm text-slate-600 bg-primary-50 p-4 rounded-xl border border-primary-100/50 leading-relaxed">
            <AlertCircle size={20} className="text-primary-600 shrink-0 mt-0.5" />
            <p>This form is dynamically generated from your company's custom field definitions. You can modify these fields in the Settings module.</p>
          </div>
        </div>
        <DynamicForm 
          fields={fields} 
          onSubmit={handleAddEmployee} 
          isLoading={isSubmitting}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
