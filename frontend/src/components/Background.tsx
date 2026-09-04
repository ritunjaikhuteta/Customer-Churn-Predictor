import React from 'react';

/** Animated grid + glow background — position fixed, z-index 0 */
export const Background: React.FC = () => (
  <div className="bg-animated" aria-hidden="true">
    <div className="bg-grid" />
    <div className="bg-glow-1" />
    <div className="bg-glow-2" />
    <div className="bg-glow-3" />
  </div>
);
