import React from 'react';
import { ShieldCheck, LogIn, UserPlus, LogOut, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

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
  return (
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
            <div className="flex items-center gap-3">
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
              >
                Log Out
              </Button>
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
  );
};
