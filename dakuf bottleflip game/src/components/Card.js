import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);
