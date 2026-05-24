import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById, getPredictionsByPatient } from '../../firebase/db';
import type { Patient, PredictionRecord } from '../../types';
import { ArrowLeft, Activity, Calendar, User, FileText, AlertTriangle, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'reports'>('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      try {
        const pData = await getPatientById(id);
        if (!pData) {
          toast.error("Patient not found");
          navigate('/patients');
          return;
        }
        setPatient(pData);
        
        const preds = await getPredictionsByPatient(id);
        setPredictions(preds.reverse()); // latest first or chronological depending on chart
      } catch (error) {
        toast.error("Error loading patient data");
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (!patient) return null;

  const chartData = predictions.map(p => ({
    date: new Date(p.createdAt?.seconds * 1000).toLocaleDateString(),
    weight: p.predictedWeight
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/patients')} className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {patient.name}
            <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
              patient.riskLevel === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
              patient.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
            }`}>
              {patient.riskLevel} Risk
            </span>
          </h1>
          <p className="text-sm text-slate-500">ID: {patient.id} • Added {new Date(patient.createdAt?.seconds * 1000).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['overview', 'predictions', 'reports'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><User size={20} className="text-primary-500"/> Maternal Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">DOB</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.dob}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Age</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.maternalAge} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Height</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.height} inches</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Weight</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.weight} lbs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Parity</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.parity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Smoker</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{patient.smoke === '1' ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><Activity size={20} className="text-primary-500"/> Prediction History Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Medical Notes</h3>
              <p className="text-amber-700 dark:text-amber-500 text-sm leading-relaxed">
                {patient.medicalNotes || "No medical notes available for this patient."}
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
              <Scale size={40} className="text-primary-200 dark:text-primary-900/50 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white">Run New Prediction</h4>
              <p className="text-sm text-slate-500 mt-2 mb-4">Analyze latest vitals with NeoHealth AI.</p>
              <button 
                onClick={() => navigate('/predictions', { state: { selectedPatientId: patient.id }})}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all"
              >
                Start AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">AI Prediction Logs</h3>
          {predictions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No predictions run for this patient yet.</p>
          ) : (
            <div className="space-y-4">
              {predictions.map(pred => (
                <div key={pred.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">{pred.predictedWeight} oz</span>
                      <span className="text-sm px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Gestation: {pred.gestation}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={12}/> {new Date(pred.createdAt?.seconds * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Confidence</p>
                      <p className="font-bold text-emerald-500">{pred.confidenceScore}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">AI Risk</p>
                      <p className={`font-bold ${pred.riskLevel === 'High' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{pred.riskLevel}</p>
                    </div>
                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-primary-600 transition-colors">
                      <FileText size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <p className="text-slate-500 text-center py-8">Reports generation system module will be available here.</p>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
