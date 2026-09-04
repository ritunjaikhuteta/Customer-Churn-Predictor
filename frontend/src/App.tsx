import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Background } from './components/Background';
import { ToastProvider } from './components/ToastNotification';
import { Home } from './pages/Home';
import { Predictor } from './pages/Predictor';
import { Analytics } from './pages/Analytics';
import { Model } from './pages/Model';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predictor />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/model" element={<Model />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="relative min-h-screen" style={{ background: '#06070A' }}>
          <Background />
          <div className="relative z-10">
            <Navbar />
            <main>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <AnimatedRoutes />
              </Suspense>
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
