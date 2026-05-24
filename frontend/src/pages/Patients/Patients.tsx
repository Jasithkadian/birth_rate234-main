import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ExternalLink, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByUser, deletePatient } from '../../firebase/db';
import type { Patient } from '../../types';
import AddPatientModal from '../../components/modals/AddPatientModal';
import { toast } from 'react-hot-toast';

const Patients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getPatientsByUser(user.uid);
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
        toast.success("Patient deleted");
        fetchPatients();
      } catch (error) {
        toast.error("Failed to delete patient");
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor neonatal patient data.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all"
        >
          <Plus size={20} />
          Add New Patient
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mother's name or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-white">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">DOB</th>
                <th className="px-6 py-4">Maternal Info</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading patients...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No patients found. Add a new patient to get started.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredPatients.map((patient, index) => (
                    <motion.tr 
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold uppercase">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{patient.name}</p>
                            <p className="text-xs text-slate-500">ID: {patient.id?.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {patient.dob}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {patient.maternalAge} yrs • {patient.weight} lbs
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          patient.riskLevel === 'High' 
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600' 
                            : patient.riskLevel === 'Medium'
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                            : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                        }`}>
                          {patient.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}
                            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                            title="View Profile"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               if(patient.id) handleDelete(e, patient.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredPatients.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing 1 to {filteredPatients.length} of {patients.length} patients</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 dark:text-white" disabled>Previous</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all dark:text-white">Next</button>
            </div>
          </div>
        )}
      </div>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPatients();
        }} 
      />
    </div>
  );
};

export default Patients;
