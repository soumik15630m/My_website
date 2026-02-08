import React, { useState, useEffect } from 'react';
import { NavItem, ViewState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  profile: { name: string; handle: string; location: string; logoText?: string; logoImage?: string };
  navItems: NavItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, profile, navItems }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoSrc = getOptimizedImageUrl(profile.logoImage);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewState) => {
    onChangeView(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || mobileMenuOpen
          ? 'glass-strong shadow-lg shadow-black/20'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <motion.div
            className="flex items-center gap-4 z-50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-sm font-semibold tracking-tight text-primaryText hover:text-accent transition-colors duration-300"
            >
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/10" />
              ) : null}
              <span>{profile.name || profile.logoText || 'Portfolio'}</span>
            </button>
            <span className="text-secondaryText/30 text-xs font-mono hidden sm:inline-block">
                // {profile.handle}
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-4 py-2 text-xs font-medium transition-all duration-300 ${isActive ? 'text-primaryText' : 'text-secondaryText/70 hover:text-primaryText'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-white/8 rounded-full border border-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 tracking-wider uppercase">
                    {item.label.replace('_', '')}
                  </span>

                  {/* Underline on hover for inactive items */}
                  {!isActive && (
                    <motion.span
                      className="absolute bottom-1 left-1/2 h-[1px] bg-accent/50"
                      initial={{ width: 0, x: '-50%' }}
                      whileHover={{ width: '60%' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden text-primaryText z-50 p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 glass-strong md:hidden pt-24 px-6"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-2xl font-semibold text-left py-4 px-4 rounded-xl transition-all duration-300 ${currentView === item.id
                    ? 'text-primaryText bg-white/5'
                    : 'text-secondaryText/60 hover:text-primaryText hover:bg-white/3'
                    }`}
                >
                  {item.label.replace('_', '')}
                </motion.button>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 pt-8 border-t border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-mono text-green-400 uppercase tracking-widest">Online</p>
              </div>
              <p className="text-sm text-secondaryText/50">{profile.location}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export MobileNavigation as null to prevent breaking imports
export const MobileNavigation = () => null;