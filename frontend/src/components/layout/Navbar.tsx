import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, UserPlus, LogOut, User, Sparkles, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { STUDENT_NAV_GROUPS, RECRUITER_NAV_GROUPS } from './Sidebar';

export interface NavbarProps {
  user: { name: string; email: string; role: string; publicSlug?: string } | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onOpenTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onLogout,
  onOpenTour,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const navGroups = user?.role === 'recruiter' ? RECRUITER_NAV_GROUPS : STUDENT_NAV_GROUPS;

  const handleMobileSelect = (viewId: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(viewId);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() =>
              onNavigate(user ? (user.role === 'recruiter' ? 'recruiter-dashboard' : 'dashboard') : 'landing')
            }
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-base tracking-tight">WorkProof AI</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Evidence-First
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">From Skills to Proof to Opportunity</p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            {onOpenTour && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTour}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                className="text-xs font-semibold bg-blue-50/50 hover:bg-blue-100/60 border-blue-200 text-blue-800"
              >
                <span className="hidden xs:inline">How It Works</span>
                <span className="xs:hidden">Tour</span>
              </Button>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md">
                  <User className="w-4 h-4 text-zinc-500" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-zinc-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="hidden sm:inline-flex"
                >
                  Log Out
                </Button>
                {/* Mobile Menu Hamburger Button */}
                <button
                  type="button"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation-drawer"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant={activeView === 'login' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('login')}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('register')}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {user && isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-50 md:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Sheet */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-zinc-900 text-sm tracking-tight">Navigation</span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Summary */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 capitalize">{user.role} Account</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                      {group.group}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMobileSelect(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-2">
              {onOpenTour && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTour();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>How WorkProof Works</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
