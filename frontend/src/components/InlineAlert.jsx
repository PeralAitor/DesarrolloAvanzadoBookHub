import React from 'react';

const InlineAlert = ({ type = 'error', message }) => {
  if (!message) return null;
  const base = 'p-3 rounded text-sm';
  if (type === 'error') return <div className={`${base} bg-red-50 border border-red-200 text-red-700`}>{message}</div>;
  if (type === 'success') return <div className={`${base} bg-green-50 border border-green-200 text-green-700`}>{message}</div>;
  return <div className={base}>{message}</div>;
};

export default InlineAlert;