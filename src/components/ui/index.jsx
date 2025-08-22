import React from 'react';

export const Button = React.memo(({ className = "", children, loading = false, ...props }) => (
  <button
    className={`px-4 py-2 rounded-xl font-medium transition border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    disabled={loading}
    {...props}
  >
    {loading ? "Loading..." : children}
  </button>
));

export const Card = React.memo(({ className = "", children }) => (
  <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>
));

export const CardContent = React.memo(({ className = "", children }) => (
  <div className={className}>{children}</div>
));

export const CardTitle = React.memo(({ className = "", children }) => (
  <div className={`font-semibold ${className}`}>{children}</div>
));

export const LoadingSpinner = React.memo(() => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
));

export const Input = React.memo(({ className = "", ...props }) => (
  <input
    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${className}`}
    {...props}
  />
));
