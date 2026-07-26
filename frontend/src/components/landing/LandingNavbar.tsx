import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-surface/90 backdrop-blur-md border-b border-border shadow-md py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-text-primary tracking-tight">
              QueryGenie
            </span>
            <span className="text-[10px] font-semibold text-primary-main -mt-1 tracking-wider uppercase">
              AI SQL Engine
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#demo"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Demo
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Features
          </a>
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-sm font-semibold text-text-primary hover:text-primary-main px-4 py-2 rounded-lg hover:bg-surface-secondary transition-all duration-150"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="relative inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
