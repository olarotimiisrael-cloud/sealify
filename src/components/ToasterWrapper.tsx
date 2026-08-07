"use client";

import React from 'react';
import { Toaster } from 'sonner';

export const ToasterWrapper: React.FC = () => {
  return (
    <Toaster 
      position="bottom-right" 
      richColors
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#0f172a',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f172a',
          },
        },
      }}
    />
  );
};

export default ToasterWrapper;