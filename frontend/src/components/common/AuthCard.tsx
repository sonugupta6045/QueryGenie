import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export default function AuthCard({ children, maxWidth = 'max-w-md' }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-text-primary selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Background ambient light glow matching landing page */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[300px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main card container */}
      <div
        className={`${maxWidth} w-full space-y-8 bg-surface border border-border p-8 sm:p-10 rounded-2xl shadow-xl backdrop-blur-xl relative z-10 transition-colors duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
