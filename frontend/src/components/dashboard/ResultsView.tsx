import React from 'react';
import type { PredictionResult } from './Dashboard';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultsViewProps {
  result: PredictionResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const isHighRisk = result.riskStatus === 'High';
  const isModerateRisk = result.riskStatus === 'Moderate';

  return (
    <div className="glass-card overflow-hidden relative">
      {/* Risk Indicator Bar */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${
        isHighRisk ? 'bg-red-500' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * (result.prediction / 160)) }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={isHighRisk ? 'text-red-500' : isModerateRisk ? 'text-amber-500' : 'text-emerald-500'}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tighter">{result.prediction}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">OZ</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Prediction Result</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              isHighRisk ? 'bg-red-100 text-red-700' : isModerateRisk ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isHighRisk && <AlertCircle size={14} />}
              {!isHighRisk && !isModerateRisk && <CheckCircle2 size={14} />}
              {result.riskStatus.toUpperCase()} RISK
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">AI Confidence</span>
              <span className="font-bold text-primary-600">{result.confidence.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-primary-600 rounded-full"
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl flex gap-3 ${
            isHighRisk ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800'
          }`}>
            <Info className={`shrink-0 ${isHighRisk ? 'text-red-500' : 'text-primary-500'}`} size={20} />
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {result.interpretation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
