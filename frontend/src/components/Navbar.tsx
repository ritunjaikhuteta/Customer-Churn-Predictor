import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, Brain, Home, TrendingDown, Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/predict', label: 'Predictor', icon: Zap },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/model', label: 'Model', icon: Brain },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'navbar-glass' : 'navbar-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="ChurnIQ home">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <Activity className="relative w-4 h-4 text-white m-2" aria-hidden="true" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="gradient-text">Churn</span>
                <span className="text-white">IQ</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white bg-white/10 border border-white/10'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* CTA + mobile menu */}
            <div className="flex items-center gap-3">
              <Link to="/predict" className="btn-primary hidden sm:inline-flex text-sm py-2 px-4">
                <TrendingDown className="w-4 h-4" aria-hidden="true" />
                Analyze Customer
              </Link>
              <button
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong border-b border-white/08 md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
              <Link to="/predict" className="btn-primary justify-center mt-2">
                <TrendingDown className="w-4 h-4" aria-hidden="true" />
                Analyze Customer
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
