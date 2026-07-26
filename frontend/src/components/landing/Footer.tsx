import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border text-text-secondary py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">QueryGenie</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <Link to="/login" className="hover:text-primary-main transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-primary-main transition-colors">
              Get Started
            </Link>
            <a href="#demo" className="hover:text-primary-main transition-colors">
              Demo
            </a>
            <a href="#how-it-works" className="hover:text-primary-main transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-primary-main transition-colors">
              Features
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} QueryGenie. All rights reserved. Safe AI-Powered SQL Engine.
          </p>
        </div>
      </div>
    </footer>
  );
}
