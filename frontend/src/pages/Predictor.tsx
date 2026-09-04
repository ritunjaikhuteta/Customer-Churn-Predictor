import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Users } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { PredictionCard } from '../components/PredictionCard';
import { CustomerQueue } from '../components/CustomerQueue';
import { Footer } from '../components/Footer';
import { useToast } from '../components/ToastNotification';
import { predict, getSampleCustomers } from '../services/api';
import type { CustomerInput, PredictionResponse, SampleCustomer } from '../types/customer';

const LOADING_STEPS = [
  'Processing customer profile...',
  'Analyzing behavior patterns...',
  'Running XGBoost model...',
  'Calculating churn probability...',
  'Generating retention insights...',
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const Predictor: React.FC = () => {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0]);
  const [customers, setCustomers] = useState<SampleCustomer[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [formKey, setFormKey] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<CustomerInput | undefined>(undefined);
  const resultRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Cycle loading messages
  const stepInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoadingSteps = useCallback(() => {
    let idx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    stepInterval.current = setInterval(() => {
      idx = (idx + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[idx]);
    }, 700);
  }, []);

  const stopLoadingSteps = useCallback(() => {
    if (stepInterval.current) clearInterval(stepInterval.current);
  }, []);

  useEffect(() => {
    getSampleCustomers()
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setQueueLoading(false));
  }, []);

  const handleSubmit = async (data: CustomerInput) => {
    setIsLoading(true);
    setResult(null);
    setCurrentCustomer(data);
    startLoadingSteps();

    try {
      const res = await predict(data);
      setResult(res);
      // Scroll to result on mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      showToast('error', err.message || 'Unable to run prediction. Please verify customer details and try again.');
    } finally {
      stopLoadingSteps();
      setIsLoading(false);
    }
  };

  const handleQueueSelect = (c: SampleCustomer) => {
    const input: CustomerInput = {
      gender: c.gender,
      SeniorCitizen: c.SeniorCitizen,
      Partner: c.Partner,
      Dependents: c.Dependents,
      tenure: c.tenure,
      PhoneService: c.PhoneService,
      MultipleLines: c.MultipleLines,
      InternetService: c.InternetService,
      OnlineSecurity: c.OnlineSecurity,
      OnlineBackup: c.OnlineBackup,
      DeviceProtection: c.DeviceProtection,
      TechSupport: c.TechSupport,
      StreamingTV: c.StreamingTV,
      StreamingMovies: c.StreamingMovies,
      Contract: c.Contract,
      PaperlessBilling: c.PaperlessBilling,
      PaymentMethod: c.PaymentMethod,
      MonthlyCharges: c.MonthlyCharges,
      TotalCharges: c.TotalCharges,
    };
    setSelectedProfile(input);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('success', `Loaded profile for ${c.id}`);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="relative z-10"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-indigo-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Customer Churn Predictor</h1>
        </div>
        <p className="text-sm text-text-secondary ml-11">
          Enter customer attributes to receive AI-powered churn probability and retention recommendations.
        </p>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div>
            <CustomerForm
              key={formKey}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={selectedProfile}
            />
          </div>

          {/* Result */}
          <div ref={resultRef} className="lg:sticky lg:top-24">
            <PredictionCard
              result={result}
              customer={currentCustomer}
              isLoading={isLoading}
              loadingStep={loadingStep}
            />
          </div>
        </div>

        {/* Customer Queue */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white">Customer Risk Queue</h2>
            <p className="text-xs text-text-muted">Click any row to load that customer's profile</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <CustomerQueue
              customers={customers}
              onSelect={handleQueueSelect}
              isLoading={queueLoading}
            />
          </div>
        </div>
      </div>

      <div className="section-divider mx-8" />
      <Footer />
    </motion.div>
  );
};
