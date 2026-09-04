import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';
import type { SampleCustomer, RiskLevel } from '../types/customer';

interface CustomerQueueProps {
  customers: SampleCustomer[];
  onSelect: (c: SampleCustomer) => void;
  isLoading?: boolean;
}

type SortKey = 'risk_score' | 'monthly_charges' | 'tenure';

const RISK_COLORS: Record<RiskLevel, string> = {
  Low:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  High:   'text-red-400    bg-red-400/10    border-red-400/20',
};

export const CustomerQueue: React.FC<CustomerQueueProps> = ({
  customers, onSelect, isLoading
}) => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [contractFilter, setContractFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('risk_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = customers
    .filter((c) => {
      const contractVal = c.contract || c.Contract || '';
      const matchSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
        contractVal.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'All' || c.risk_level === riskFilter;
      const matchContract = contractFilter === 'All' || contractVal === contractFilter;
      return matchSearch && matchRisk && matchContract;
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * mul;
    });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search customers..."
            className="custom-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customer queue"
          />
        </div>

        {/* Risk filter */}
        <select
          className="custom-select w-auto"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'All')}
          aria-label="Filter by risk level"
        >
          <option value="All">All Risks</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>

        {/* Contract filter */}
        <select
          className="custom-select w-auto"
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
          aria-label="Filter by contract"
        >
          <option value="All">All Contracts</option>
          <option value="Month-to-month">Month-to-month</option>
          <option value="One year">One year</option>
          <option value="Two year">Two year</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted">
        Showing {filtered.length} of {customers.length} customers
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/06">
        <table className="w-full text-sm" role="table" aria-label="Customer risk queue">
          <thead>
            <tr className="border-b border-white/06" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Contract
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('tenure')}
                role="columnheader"
                aria-sort={sortKey === 'tenure' ? sortDir === 'asc' ? 'ascending' : 'descending' : 'none'}
              >
                <div className="flex items-center justify-end gap-1">
                  Tenure
                  {sortKey === 'tenure' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('monthly_charges')}
                role="columnheader"
                aria-sort={sortKey === 'monthly_charges' ? sortDir === 'asc' ? 'ascending' : 'descending' : 'none'}
              >
                <div className="flex items-center justify-end gap-1">
                  Monthly $
                  {sortKey === 'monthly_charges' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('risk_score')}
                role="columnheader"
                aria-sort={sortKey === 'risk_score' ? sortDir === 'asc' ? 'ascending' : 'descending' : 'none'}
              >
                <div className="flex items-center justify-end gap-1">
                  Risk Score
                  {sortKey === 'risk_score' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted text-sm">
                  No customers match the filters.
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/04 hover:bg-white/03 transition-colors cursor-pointer"
                  onClick={() => onSelect(c)}
                  role="row"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelect(c)}
                  aria-label={`Load ${c.id} profile — ${c.risk_level} risk`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white text-xs">{c.id}</div>
                    <div className="text-xs text-text-muted">{c.internet_service}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{c.contract || c.Contract}</td>
                  <td className="px-4 py-3 text-right text-xs text-text-secondary tabular-nums">
                    {c.tenure} mo
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-text-secondary tabular-nums">
                    ${c.monthly_charges.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-bold text-white tabular-nums">
                      {c.risk_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${RISK_COLORS[c.risk_level]}`}>
                      {c.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onSelect(c); }}
                      aria-label={`Analyze ${c.id}`}
                    >
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      Analyze
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
