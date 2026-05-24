import React, { useState } from 'react';
import type { PredictionData } from './Dashboard';
import { Baby, Calendar, User, Ruler, Weight, Cigarette, ShieldCheck } from 'lucide-react';

interface PredictionFormProps {
  onPredict: (data: PredictionData) => void;
  isLoading: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onPredict, isLoading }) => {
  const [formData, setFormData] = useState<PredictionData>({
    gestation: 38,
    parity: 1,
    age: 28,
    height: 64,
    weight: 150,
    smoke: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSmokeToggle = (val: number) => {
    setFormData(prev => ({ ...prev, smoke: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <div className="glass-card">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-primary-600">
          <Baby size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Maternal Metrics</h2>
          <p className="text-sm text-slate-500">Enter pregnancy and health data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gestation / Month */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar size={16} /> Pregnancy Month
            </label>
            <input
              type="number"
              name="gestation"
              value={formData.gestation}
              onChange={handleChange}
              min="1"
              max="12"
              className="input-field"
              required
            />
          </div>

          {/* Parity */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Baby size={16} /> Parity (Prior Births)
            </label>
            <input
              type="number"
              name="parity"
              value={formData.parity}
              onChange={handleChange}
              min="0"
              className="input-field"
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <User size={16} /> Maternal Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="15"
              max="55"
              className="input-field"
              required
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Ruler size={16} /> Height (Inches)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="30"
              max="100"
              className="input-field"
              required
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Weight size={16} /> Pre-pregnancy Weight (lbs)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="50"
              max="600"
              className="input-field"
              required
            />
          </div>

          {/* Smoking Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Cigarette size={16} /> Smoking Status
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSmokeToggle(0)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formData.smoke === 0 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' 
                    : 'bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                }`}
              >
                Non-Smoker
              </button>
              <button
                type="button"
                onClick={() => handleSmokeToggle(1)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formData.smoke === 1 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' 
                    : 'bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                }`}
              >
                Smoker
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck size={20} />
              Run AI Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;
