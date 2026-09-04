import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Wifi, FileText, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import type { CustomerInput, Gender, YesNo, ContractType, PaymentMethod, InternetService, YesNoNone, YesNoNoInternet } from '../types/customer';

// ── Demo profiles ──────────────────────────────────────────────────────
const HIGH_RISK_PROFILE: CustomerInput = {
  gender: 'Female', SeniorCitizen: 0, Partner: 'No', Dependents: 'No',
  tenure: 4, PhoneService: 'Yes', MultipleLines: 'No',
  InternetService: 'Fiber optic', OnlineSecurity: 'No', OnlineBackup: 'No',
  DeviceProtection: 'No', TechSupport: 'No', StreamingTV: 'Yes', StreamingMovies: 'Yes',
  Contract: 'Month-to-month', PaperlessBilling: 'Yes', PaymentMethod: 'Electronic check',
  MonthlyCharges: 95.50, TotalCharges: 382,
};

const LOW_RISK_PROFILE: CustomerInput = {
  gender: 'Male', SeniorCitizen: 0, Partner: 'Yes', Dependents: 'Yes',
  tenure: 60, PhoneService: 'Yes', MultipleLines: 'Yes',
  InternetService: 'DSL', OnlineSecurity: 'Yes', OnlineBackup: 'Yes',
  DeviceProtection: 'Yes', TechSupport: 'Yes', StreamingTV: 'No', StreamingMovies: 'No',
  Contract: 'Two year', PaperlessBilling: 'No', PaymentMethod: 'Credit card (automatic)',
  MonthlyCharges: 54.75, TotalCharges: 3285,
};

const DEFAULT_FORM: CustomerInput = {
  gender: 'Male', SeniorCitizen: 0, Partner: 'No', Dependents: 'No',
  tenure: 12, PhoneService: 'Yes', MultipleLines: 'No',
  InternetService: 'Fiber optic', OnlineSecurity: 'No', OnlineBackup: 'No',
  DeviceProtection: 'No', TechSupport: 'No', StreamingTV: 'No', StreamingMovies: 'No',
  Contract: 'Month-to-month', PaperlessBilling: 'Yes', PaymentMethod: 'Electronic check',
  MonthlyCharges: 70, TotalCharges: 840,
};

// ── Sub-components ─────────────────────────────────────────────────────
interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
  helper?: string;
  id: string;
}

function Segmented<T extends string | number>({ label, value, options, onChange, helper, id }: SegmentedProps<T>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="segmented-control" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            className={`segmented-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {helper && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  helper?: string;
  id: string;
}

function SelectField({ label, value, options, onChange, helper, id }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        className="custom-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helper ? `${id}-helper` : undefined}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {helper && <p id={`${id}-helper`} className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  helper?: string;
  id: string;
  prefix?: string;
  suffix?: string;
}

function SliderField({ label, value, min, max, step = 1, onChange, helper, id, prefix = '', suffix = '' }: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-bold text-white tabular-nums">
          {prefix}{value}{suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`${label}: ${prefix}${value}${suffix}`}
      />
      <div className="flex justify-between text-xs text-text-muted">
        <span>{prefix}{min}</span><span>{prefix}{max}</span>
      </div>
      {helper && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helper?: string;
  id: string;
  min?: number;
  prefix?: string;
}

function NumberInput({ label, value, onChange, helper, id, min = 0, prefix }: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          min={min}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`custom-input ${prefix ? 'pl-8' : ''}`}
          aria-describedby={helper ? `${id}-helper` : undefined}
        />
      </div>
      {helper && <p id={`${id}-helper`} className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────
const sectionIcons: Record<string, React.ReactNode> = {
  Personal: <User className="w-4 h-4" />,
  Account: <FileText className="w-4 h-4" />,
  Services: <Wifi className="w-4 h-4" />,
  Billing: <CreditCard className="w-4 h-4" />,
};

function SectionHeader({ title, step }: { title: string; step: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
        {sectionIcons[title] || step}
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="flex-1 h-px bg-white/06" />
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────
interface CustomerFormProps {
  onSubmit: (data: CustomerInput) => void;
  isLoading: boolean;
  onLoadSample?: (data: CustomerInput) => void;
  initialData?: CustomerInput;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, isLoading, onLoadSample, initialData }) => {
  const [form, setForm] = useState<CustomerInput>(initialData ?? DEFAULT_FORM);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const set = useCallback(<K extends keyof CustomerInput>(key: K) => (value: CustomerInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const loadProfile = (profile: CustomerInput) => {
    setForm(profile);
    onLoadSample?.(profile);
  };

  const internetOptions = (value: string) =>
    form.InternetService === 'No' ? ['No internet service'] : ['Yes', 'No', 'No internet service'];

  return (
    <form onSubmit={handleSubmit} className="space-y-8" aria-label="Customer analysis form" noValidate>

      {/* Demo buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => loadProfile(HIGH_RISK_PROFILE)}
          className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Load high-risk customer example"
        >
          🔴 Load High-Risk Example
        </button>
        <button
          type="button"
          onClick={() => loadProfile(LOW_RISK_PROFILE)}
          className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          aria-label="Load low-risk customer example"
        >
          🟢 Load Low-Risk Example
        </button>
        <button
          type="button"
          onClick={() => setForm(DEFAULT_FORM)}
          className="p-2 rounded-xl border border-white/08 text-text-secondary hover:text-white hover:bg-white/05 transition-colors"
          aria-label="Reset form to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Section 1: Personal ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader title="Personal" step={1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Segmented<Gender>
            id="gender" label="Gender" value={form.gender}
            options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
            onChange={set('gender')}
          />
          <Segmented<0 | 1>
            id="seniorCitizen" label="Senior Citizen" value={form.SeniorCitizen}
            options={[{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }]}
            onChange={set('SeniorCitizen')}
          />
          <Segmented<YesNo>
            id="partner" label="Partner" value={form.Partner}
            options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]}
            onChange={set('Partner')}
          />
          <Segmented<YesNo>
            id="dependents" label="Dependents" value={form.Dependents}
            options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]}
            onChange={set('Dependents')}
          />
        </div>
      </div>

      {/* ── Section 2: Account ──────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader title="Account" step={2} />
        <div className="space-y-5">
          <SliderField
            id="tenure" label="Tenure (Months)" value={form.tenure}
            min={0} max={72} onChange={set('tenure')} suffix=" mo"
            helper="Number of months the customer has been subscribed"
          />
          <SelectField
            id="contract" label="Contract Type" value={form.Contract}
            options={['Month-to-month', 'One year', 'Two year']}
            onChange={(v) => set('Contract')(v as ContractType)}
          />
          <div className="grid grid-cols-2 gap-5">
            <Segmented<YesNo>
              id="paperlessBilling" label="Paperless Billing" value={form.PaperlessBilling}
              options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]}
              onChange={set('PaperlessBilling')}
            />
            <SelectField
              id="paymentMethod" label="Payment Method" value={form.PaymentMethod}
              options={[
                'Electronic check',
                'Mailed check',
                'Bank transfer (automatic)',
                'Credit card (automatic)',
              ]}
              onChange={(v) => set('PaymentMethod')(v as PaymentMethod)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Services ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader title="Services" step={3} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Segmented<YesNo>
            id="phoneService" label="Phone Service" value={form.PhoneService}
            options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }]}
            onChange={set('PhoneService')}
          />
          <SelectField
            id="multipleLines" label="Multiple Lines" value={form.MultipleLines}
            options={form.PhoneService === 'No' ? ['No phone service'] : ['Yes', 'No', 'No phone service']}
            onChange={(v) => set('MultipleLines')(v as YesNoNone)}
          />
          <SelectField
            id="internetService" label="Internet Service" value={form.InternetService}
            options={['DSL', 'Fiber optic', 'No']}
            onChange={(v) => set('InternetService')(v as InternetService)}
          />
          <SelectField
            id="onlineSecurity" label="Online Security" value={form.OnlineSecurity}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('OnlineSecurity')(v as YesNoNoInternet)}
          />
          <SelectField
            id="onlineBackup" label="Online Backup" value={form.OnlineBackup}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('OnlineBackup')(v as YesNoNoInternet)}
          />
          <SelectField
            id="deviceProtection" label="Device Protection" value={form.DeviceProtection}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('DeviceProtection')(v as YesNoNoInternet)}
          />
          <SelectField
            id="techSupport" label="Tech Support" value={form.TechSupport}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('TechSupport')(v as YesNoNoInternet)}
          />
          <SelectField
            id="streamingTV" label="Streaming TV" value={form.StreamingTV}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('StreamingTV')(v as YesNoNoInternet)}
          />
          <SelectField
            id="streamingMovies" label="Streaming Movies" value={form.StreamingMovies}
            options={internetOptions(form.InternetService)}
            onChange={(v) => set('StreamingMovies')(v as YesNoNoInternet)}
          />
        </div>
      </div>

      {/* ── Section 4: Billing ──────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader title="Billing" step={4} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <NumberInput
            id="monthlyCharges" label="Monthly Charges" value={form.MonthlyCharges}
            onChange={set('MonthlyCharges')} prefix="$" min={0}
            helper="Current monthly telecom bill"
          />
          <NumberInput
            id="totalCharges" label="Total Charges" value={form.TotalCharges}
            onChange={set('TotalCharges')} prefix="$" min={0}
            helper="Total amount billed to date"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-analyze"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" aria-hidden="true" />
            Run Churn Analysis
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
};
