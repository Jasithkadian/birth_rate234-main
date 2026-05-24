import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { addPatient } from '../../firebase/db';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const patientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  maternalAge: z.number().min(15).max(55),
  height: z.number().min(30).max(100),
  weight: z.number().min(50).max(600),
  parity: z.number().min(0).max(15),
  smoke: z.enum(['0', '1']),
  medicalNotes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { smoke: '0' }
  });

  const onSubmit = async (data: PatientFormData) => {
    if (!user) return;
    try {
      // Determine initial risk level based on simple heuristics (can be updated by AI later)
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      if (data.maternalAge > 35 || data.maternalAge < 18 || data.smoke === '1') {
        riskLevel = 'Medium';
      }
      if ((data.maternalAge > 40 && data.smoke === '1') || data.weight > 300) {
        riskLevel = 'High';
      }

      await addPatient({
        ...data,
        userId: user.uid,
        riskLevel
      });
      toast.success("Patient added successfully");
      reset();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add patient");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Patient</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="add-patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Patient Full Name</label>
                  <input type="text" {...register('name')} className="input-field" placeholder="Jane Doe" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input type="date" {...register('dob')} className="input-field" />
                  {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maternal Age</label>
                  <input type="number" {...register('maternalAge', { valueAsNumber: true })} className="input-field" placeholder="e.g. 28" />
                  {errors.maternalAge && <p className="text-xs text-red-500">{errors.maternalAge.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (inches)</label>
                  <input type="number" {...register('height', { valueAsNumber: true })} className="input-field" placeholder="e.g. 65" />
                  {errors.height && <p className="text-xs text-red-500">{errors.height.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (lbs)</label>
                  <input type="number" {...register('weight', { valueAsNumber: true })} className="input-field" placeholder="e.g. 150" />
                  {errors.weight && <p className="text-xs text-red-500">{errors.weight.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parity (Number of pregnancies)</label>
                  <input type="number" {...register('parity', { valueAsNumber: true })} className="input-field" placeholder="e.g. 1" />
                  {errors.parity && <p className="text-xs text-red-500">{errors.parity.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Smoking Status</label>
                  <select {...register('smoke')} className="input-field">
                    <option value="0">Non-Smoker</option>
                    <option value="1">Smoker</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical Notes</label>
                <textarea {...register('medicalNotes')} rows={3} className="input-field resize-none" placeholder="Any underlying conditions, allergies..."></textarea>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              form="add-patient-form"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPatientModal;
