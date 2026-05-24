import React from 'react';
import type { PredictionResult } from './Dashboard';
import { ShieldAlert, HeartPulse, History, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsCardsProps {
  result: PredictionResult | null;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ result }) => {
  const isHighRisk = result?.riskStatus === 'High';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Risk Analysis Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card flex flex-col items-center text-center py-8"
      >
        <div className={`p-3 rounded-full mb-4 ${
          isHighRisk ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
        }`}>
          <ShieldAlert size={24} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Status</span>
        <h4 className={`text-xl font-bold ${isHighRisk ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
          {isHighRisk ? 'High Risk' : result ? 'Healthy' : '---'}
        </h4>
      </motion.div>

      {/* Maternal Score Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card flex flex-col items-center text-center py-8"
      >
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <HeartPulse size={24} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Health Score</span>
        <h4 className="text-xl font-bold text-slate-700 dark:text-slate-200">
          {result ? '88/100' : '---'}
        </h4>
      </motion.div>

      {/* Pregnancy Progress Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card flex flex-col items-center text-center py-8"
      >
        <div className="p-3 rounded-full bg-primary-100 text-primary-600 mb-4">
          <TrendingUp size={24} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Growth Trend</span>
        <h4 className="text-xl font-bold text-slate-700 dark:text-slate-200">
          {result ? 'Stable' : '---'}
        </h4>
      </motion.div>
      
      {/* Detailed Progress Card (Span 3) */}
      <div className="md:col-span-3 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="text-primary-600" size={20} />
            <h4 className="font-bold">Pregnancy Progress Timeline</h4>
          </div>
          <span className="text-sm font-semibold text-primary-600">Month 7 of 9</span>
        </div>
        
        <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[77%] bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full" />
          
          {/* Markers */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
            <div 
              key={m}
              className={`absolute top-0 w-0.5 h-full bg-white/20`} 
              style={{ left: `${(m/9)*100}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <span>First Trimester</span>
          <span>Second Trimester</span>
          <span>Third Trimester</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;
