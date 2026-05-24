import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Heart, ArrowRight, PlayCircle } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-bold tracking-wide uppercase">
              <Zap size={16} />
              AI-Powered Neonatal Care
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Predicting the <span className="text-primary-600">Future</span> of Neonatal Health.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              NeoHealth AI leverages advanced machine learning to provide accurate birth weight predictions and real-time health monitoring for newborn care.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/login"
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all transform hover:-translate-y-1"
              >
                Get Started Now
                <ArrowRight size={20} />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:-translate-y-1">
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>
            
            <div className="flex items-center gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">98%</p>
                <p className="text-sm text-slate-500">Accuracy Rate</p>
              </div>
              <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">10k+</p>
                <p className="text-sm text-slate-500">Patients Monitored</p>
              </div>
              <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">50+</p>
                <p className="text-sm text-slate-500">Hospitals Joined</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Healthcare Professional"
                className="w-full h-auto"
              />
            </div>
            {/* Floating Stats */}
            <div className="absolute top-10 -left-10 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Stability</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">99.9% Normal</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 z-20 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Heart className="text-red-500 fill-red-500" size={16} />
                  <span className="text-xs font-bold text-slate-500">Heart Rate</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">124 <span className="text-sm font-normal text-slate-500">BPM</span></p>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/10 rounded-full blur-[100px] -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Why Choose NeoHealth AI?</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Our platform combines medical expertise with cutting-edge technology to ensure the best outcomes for neonatal care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Accurate Predictions',
              desc: 'Trained on over 100,000 clinical records for unmatched accuracy in birth weight estimates.',
              icon: Activity,
              color: 'text-primary-600',
              bg: 'bg-primary-100'
            },
            {
              title: 'Secure & Private',
              desc: 'Enterprise-grade security and HIPAA compliance ensure patient data remains confidential.',
              icon: Shield,
              color: 'text-emerald-600',
              bg: 'bg-emerald-100'
            },
            {
              title: 'Real-time Monitoring',
              desc: 'Monitor vital signs and receive instant alerts for high-risk neonatal patients.',
              icon: Zap,
              color: 'text-amber-600',
              bg: 'bg-amber-100'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
            >
              <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
