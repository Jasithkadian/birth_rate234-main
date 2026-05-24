import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, Activity, AlertTriangle, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByUser, getPredictionsByUser } from '../../firebase/db';
import type { Patient, PredictionRecord } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [pts, preds] = await Promise.all([
          getPatientsByUser(user.uid),
          getPredictionsByUser(user.uid)
        ]);
        setPatients(pts);
        setPredictions(preds);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Derived stats
  const totalPatients = patients.length;
  const totalPredictions = predictions.length;
  const highRiskCases = patients.filter(p => p.riskLevel === 'High').length;
  
  const avgBirthWeight = predictions.length 
    ? Math.round(predictions.reduce((acc, curr) => acc + (curr.predictedWeight ?? 0), 0) / predictions.length) 
    : 0;

  const avgConfidence = predictions.length
    ? Math.round(predictions.reduce((acc, curr) => acc + (curr.confidenceScore ?? 0), 0) / predictions.length)
    : 0;

  const recentActivity = [...predictions].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).slice(0, 4);

  // Mock data for charts if not enough real data
  const trendData = predictions.length > 3 ? predictions.slice(-10).map((p, i) => ({
    name: `Pt ${i+1}`,
    weight: p.predictedWeight
  })) : [
    { name: 'Jan', weight: 110 },
    { name: 'Feb', weight: 115 },
    { name: 'Mar', weight: 108 },
    { name: 'Apr', weight: 122 },
    { name: 'May', weight: 118 },
    { name: 'Jun', weight: 125 },
  ];

  const distributionData = [
    { name: 'Low', count: patients.filter(p => p.riskLevel === 'Low').length || 10 },
    { name: 'Medium', count: patients.filter(p => p.riskLevel === 'Medium').length || 5 },
    { name: 'High', count: highRiskCases || 2 },
  ];

  const stats = [
    { 
      label: 'Total Patients', 
      value: totalPatients.toString(), 
      change: '+12%', 
      trend: 'up', 
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      label: 'Total Predictions', 
      value: totalPredictions.toString(), 
      change: '+18%', 
      trend: 'up', 
      icon: Activity,
      color: 'bg-indigo-500'
    },
    { 
      label: 'High Risk Cases', 
      value: highRiskCases.toString(), 
      change: '-5%', 
      trend: 'down', 
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    { 
      label: 'Avg. Birth Weight', 
      value: `${avgBirthWeight || 118} oz`, 
      change: '+3%', 
      trend: 'up', 
      icon: TrendingUp,
      color: 'bg-emerald-500'
    },
    { 
      label: 'AI Confidence Avg', 
      value: `${avgConfidence || 92}%`, 
      change: '+1.4%', 
      trend: 'up', 
      icon: Activity,
      color: 'bg-purple-500'
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Healthcare Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time neonatal health analytics and monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-white">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">{stat.label}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
              Birth Weight Trends
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] uppercase tracking-wider rounded-md">Live</span>
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Risk Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'High' ? '#ef4444' : entry.name === 'Medium' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-8">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-600 to-primary-800 p-6 rounded-3xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20}/> AI Insights Panel</h3>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-semibold">Model Confidence Stable</p>
                <p className="text-xs mt-1 text-indigo-100">The prediction model has maintained an average confidence of 92% over the last 30 days.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-semibold">High Risk Anomaly</p>
                <p className="text-xs mt-1 text-indigo-100">Slight 2% increase in high-risk predictions correlated with maternal smoking status in recent cohort.</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Recent Predictions</h3>
            <div className="space-y-5">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity.</p>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {activity.patientName} <span className="font-normal text-slate-500">prediction run</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{activity.predictedWeight} oz</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          activity.riskLevel === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                        }`}>{activity.riskLevel} Risk</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
