import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Activity, Save, RefreshCw, AlertCircle, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByUser, addPredictionRecord, updatePatient } from '../../firebase/db';
import type { Patient, PredictionRecord } from '../../types';

const predictionSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  gestation: z.number().min(20).max(450),
  parity: z.number().min(0).max(15),
  age: z.number().min(15).max(55),
  height: z.number().min(30).max(100),
  weight: z.number().min(50).max(600),
  smoke: z.enum(['0', '1']),
});

type PredictionFormData = z.infer<typeof predictionSchema>;

const Predictions: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [predictionResult, setPredictionResult] = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const preSelectedPatientId = location.state?.selectedPatientId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      smoke: '0',
      patientId: preSelectedPatientId || ''
    }
  });

  const watchPatientId = watch('patientId');

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        const pts = await getPatientsByUser(user.uid);
        setPatients(pts);
        
        if (preSelectedPatientId) {
          const pt = pts.find(p => p.id === preSelectedPatientId);
          if (pt) {
            setSelectedPatient(pt);
            setValue('age', pt.maternalAge);
            setValue('height', pt.height ?? 0);
            setValue('weight', pt.weight ?? 0);
            setValue('parity', pt.parity ?? 0);
            setValue('smoke', pt.smoke ?? '0');
          }
        }
      } catch (error) {
        toast.error("Failed to load patients for selection.");
      }
    };
    fetchPatients();
  }, [user, preSelectedPatientId, setValue]);

  // Handle manual patient selection change
  useEffect(() => {
    if (watchPatientId && patients.length > 0) {
      const pt = patients.find(p => p.id === watchPatientId);
      if (pt) {
        setSelectedPatient(pt);
        setValue('age', pt.maternalAge);
        setValue('height', pt.height ?? 0);
        setValue('weight', pt.weight ?? 0);
        setValue('parity', pt.parity ?? 0);
        setValue('smoke', pt.smoke ?? '0');
      }
    } else {
      setSelectedPatient(null);
    }
  }, [watchPatientId, patients, setValue]);

  const onSubmit = async (data: PredictionFormData) => {
    if (!selectedPatient || !user) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('gestation', data.gestation.toString());
      formData.append('parity', data.parity.toString());
      formData.append('age', data.age.toString());
      formData.append('height', data.height.toString());
      formData.append('weight', data.weight.toString());
      formData.append('smoke', data.smoke);

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      
      // Calculate mock confidence and risk based on inputs + prediction
      let confidence = 92;
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      let recommendations = "Standard postnatal care recommended.";

      if (result.prediction < 88) { // Under 5.5 lbs approx
        riskLevel = 'High';
        confidence = 88;
        recommendations = "Low birth weight indicated. Prepare NICU team. Monitor for respiratory distress.";
      } else if (result.prediction > 160) { // Over 10 lbs approx
        riskLevel = 'Medium';
        confidence = 85;
        recommendations = "Macrosomia risk. Monitor maternal glucose. Prepare for potential surgical delivery.";
      }

      const newRecord: PredictionRecord = {
        patientId: selectedPatient.id!,
        userId: user.uid,
        patientName: selectedPatient.name,
        gestation: data.gestation,
        maternalAge: data.age,
        height: data.height,
        weight: data.weight,
        parity: data.parity,
        smoke: data.smoke,
        predictedWeight: result.prediction,
        confidenceScore: confidence,
        riskLevel,
        aiRecommendations: recommendations,
        createdAt: null
      };

      setPredictionResult(newRecord);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      toast.error("Error generating prediction. Make sure Flask backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPatient = async () => {
    if (!predictionResult || !selectedPatient || !selectedPatient.id) return;
    setSaving(true);
    try {
      await addPredictionRecord(predictionResult);
      // Update patient risk if the prediction risk is higher
      if (predictionResult.riskLevel === 'High' && selectedPatient.riskLevel !== 'High') {
        await updatePatient(selectedPatient.id, { riskLevel: 'High' });
      }
      toast.success("Prediction saved to patient profile!");
      navigate(`/patients/${selectedPatient.id}`);
    } catch (error) {
      toast.error("Failed to save prediction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Run AI Prediction</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Select a patient and analyze clinical data using our ML model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 mb-6">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon size={18} className="text-primary-600" /> Select Patient
              </label>
              <select
                {...register('patientId')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white"
              >
                <option value="">-- Choose a patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (ID: {p.id?.slice(0,6)})</option>
                ))}
              </select>
              {errors.patientId && <p className="text-xs text-red-500">{errors.patientId.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gestation (Days)</label>
                <input
                  type="number"
                  {...register('gestation', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="e.g. 280"
                />
                {errors.gestation && <p className="text-xs text-red-500">{errors.gestation.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parity</label>
                <input
                  type="number"
                  {...register('parity', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="0-15"
                />
                {errors.parity && <p className="text-xs text-red-500">{errors.parity.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mother's Age</label>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="15-55"
                />
                {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height (Inches)</label>
                <input
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="30-100"
                />
                {errors.height && <p className="text-xs text-red-500">{errors.height.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (Pounds)</label>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="50-600"
                />
                {errors.weight && <p className="text-xs text-red-500">{errors.weight.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Smoking Status</label>
                <select
                  {...register('smoke')}
                  className="input-field"
                >
                  <option value="0">Non-Smoker</option>
                  <option value="1">Smoker</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !watchPatientId}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 mt-6"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Activity size={20} />
              )}
              {loading ? "Analyzing..." : "Generate AI Prediction"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {predictionResult !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-xl font-medium opacity-90">Predicted Birth Weight</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-6xl font-black tracking-tighter">{predictionResult.predictedWeight}</span>
                      <span className="text-2xl font-bold opacity-80">oz</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase font-bold text-white/60 mb-1">AI Confidence</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">{predictionResult.confidenceScore}%</span>
                      </div>
                      <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${predictionResult.confidenceScore}%` }}></div>
                      </div>
                    </div>

                    <div className={`rounded-xl p-4 backdrop-blur-sm border ${
                      predictionResult.riskLevel === 'High' ? 'bg-red-500/20 border-red-500/50' : 
                      predictionResult.riskLevel === 'Medium' ? 'bg-amber-500/20 border-amber-500/50' : 
                      'bg-white/10 border-white/10'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Risk Assessment</p>
                      <span className="text-xl font-bold">{predictionResult.riskLevel}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-white/60 mb-1">AI Recommendation</p>
                    <p className="text-sm font-medium leading-relaxed">
                      {predictionResult.aiRecommendations}
                    </p>
                  </div>
                  
                  <div className="pt-2 flex gap-4">
                    <button 
                      onClick={() => setPredictionResult(null)}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex-1"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleSaveToPatient}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-primary-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex-[2]"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                      Save Record
                    </button>
                  </div>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-sm rounded-2xl flex items-center justify-center text-primary-500 mb-6 relative">
                  <Activity size={32} />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Awaiting Data</h3>
                <p className="text-slate-500 max-w-[280px] mt-2">
                  Select a patient and fill in the clinical parameters to generate an AI risk analysis and weight prediction.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-6 rounded-3xl flex gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Clinical Disclaimer</h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                NeoHealth AI is a supportive diagnostic tool. Predictions and risk assessments should be validated by attending physicians and not solely relied upon for emergency interventions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
