import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { SkillGapPage } from './pages/SkillGapPage';
import { MissionWorkspacePage } from './pages/MissionWorkspacePage';
import { EvaluationResultPage } from './pages/EvaluationResultPage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { CandidateEvidencePage } from './pages/CandidateEvidencePage';
import { RecruiterProfilePage } from './pages/RecruiterProfilePage';
import { PublicPassportPage } from './pages/PublicPassportPage';
import { StudentPassportSettingsPage } from './pages/StudentPassportSettingsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { RecruiterOpportunitiesPage } from './pages/RecruiterOpportunitiesPage';
import { GuidedWalkthroughModal } from './components/guidance/GuidedWalkthroughModal';
import { getStoredUser, getAuthToken, clearAuthSession } from './utils/auth';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('landing');
  const [activeMissionSlug, setActiveMissionSlug] = useState<string>('backend-order-total-bug');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('650000000000000000000001');
  const [activePublicSlug, setActivePublicSlug] = useState<string>('alex-chen-wk7a');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    publicSlug?: string;
  } | null>(null);

  // Restore user session or detect public passport route on mount
  useEffect(() => {
    // Check if initial URL is a public passport route /passport/:slug
    const pathname = window.location.pathname;
    if (pathname.startsWith('/passport/')) {
      const slug = pathname.replace('/passport/', '').split('/')[0] || 'alex-chen-wk7a';
      setActivePublicSlug(slug);
      setActiveView('public-passport');
      return;
    }

    try {
      const storedUser = getStoredUser();
      const storedToken = getAuthToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        if (storedUser.role === 'recruiter') {
          setActiveView('recruiter-dashboard');
        } else {
          setActiveView('dashboard');
        }
      }
    } catch {
      clearAuthSession();
    }

    const onAuthExpired = () => {
      clearAuthSession();
      setUser(null);
      setActiveView('landing');
    };

    window.addEventListener('workproof:auth-expired', onAuthExpired);
    return () => {
      window.removeEventListener('workproof:auth-expired', onAuthExpired);
    };
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role === 'recruiter') {
      setActiveView('recruiter-dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setActiveView('landing');
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const handleOpenMission = (slug: string) => {
    setActiveMissionSlug(slug || 'backend-order-total-bug');
    setActiveView('missions');
  };

  const handleOpenEvaluation = (slug?: string) => {
    if (slug) {
      setActiveMissionSlug(slug);
    }
    setActiveView('evaluation');
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveView('recruiter-candidate-detail');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeView={activeView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      {user ? (
        <div className="flex flex-1">
          {/* Authenticated Navigation Sidebar */}
          <div className="hidden md:block shrink-0">
            <Sidebar
              activeView={activeView}
              onNavigate={handleNavigate}
              role={user.role}
            />
          </div>

          {/* Main Dashboard / Page View Area */}
          <main className="flex-1 overflow-y-auto">
            {/* Global Public Passport View when logged in */}
            {activeView === 'public-passport' && (
              <PublicPassportPage
                slug={activePublicSlug}
                onNavigateHome={() =>
                  setActiveView(user.role === 'recruiter' ? 'recruiter-dashboard' : 'dashboard')
                }
              />
            )}

            {/* Recruiter Views */}
            {user.role === 'recruiter' && activeView !== 'public-passport' && (
              <>
                {(activeView === 'recruiter-dashboard' ||
                  activeView === 'recruiter-candidates' ||
                  activeView === 'dashboard') && (
                  <RecruiterDashboardPage
                    onViewCandidate={handleSelectCandidate}
                    onNavigateToProfile={() => setActiveView('recruiter-profile')}
                  />
                )}

                {activeView === 'recruiter-candidate-detail' && (
                  <CandidateEvidencePage
                    studentId={selectedCandidateId}
                    onBack={() => setActiveView('recruiter-dashboard')}
                    onViewPublicPassport={(slug) => {
                      setActivePublicSlug(slug);
                      setActiveView('public-passport');
                    }}
                  />
                )}

                {activeView === 'recruiter-profile' && <RecruiterProfilePage />}

                {activeView === 'recruiter-opportunities' && (
                  <RecruiterOpportunitiesPage
                    onViewCandidatePassport={(slug) => {
                      setActivePublicSlug(slug);
                      setActiveView('public-passport');
                    }}
                    onViewCandidateDossier={(studentId) => {
                      setSelectedCandidateId(studentId);
                      setActiveView('recruiter-candidate-detail');
                    }}
                  />
                )}
              </>
            )}

            {/* Student Views */}
            {user.role !== 'recruiter' && activeView !== 'public-passport' && (
              <>
                {activeView === 'dashboard' && (
                  <StudentDashboard
                    user={user}
                    onNavigate={handleNavigate}
                    onOpenTour={() => setIsTourOpen(true)}
                  />
                )}

                {activeView === 'profile' && <ProfilePage />}

                {(activeView === 'passport' || activeView === 'passport-settings') && (
                  <StudentPassportSettingsPage
                    onPreviewPublicPassport={(slug) => {
                      setActivePublicSlug(slug);
                      setActiveView('public-passport');
                    }}
                    onOpenTour={() => setIsTourOpen(true)}
                  />
                )}

                {(activeView === 'skill-gap' || activeView === 'target-role') && (
                  <div className="p-6">
                    <SkillGapPage
                      onNavigateToMission={handleOpenMission}
                      onOpenTour={() => setIsTourOpen(true)}
                    />
                  </div>
                )}

                {(activeView === 'missions' || activeView === 'simulator') && (
                  <MissionWorkspacePage
                    missionSlug={activeMissionSlug}
                    onBack={() => setActiveView('dashboard')}
                    onViewSkillGap={() => setActiveView('skill-gap')}
                    onViewEvaluation={handleOpenEvaluation}
                    onOpenTour={() => setIsTourOpen(true)}
                  />
                )}

                {(activeView === 'evaluation' || activeView === 'submissions') && (
                  <EvaluationResultPage
                    missionSlug={activeMissionSlug}
                    onBackToDashboard={() => setActiveView('dashboard')}
                    onViewSkillGap={() => setActiveView('skill-gap')}
                    onReviewMission={() => setActiveView('missions')}
                    onOpenTour={() => setIsTourOpen(true)}
                  />
                )}
                {activeView === 'opportunities' && (
                  <OpportunitiesPage
                    onNavigateToMission={handleOpenMission}
                    onNavigateToPassport={() => setActiveView('passport')}
                    onPreviewPublicPassport={(slug) => {
                      setActivePublicSlug(slug);
                      setActiveView('public-passport');
                    }}
                    onOpenTour={() => setIsTourOpen(true)}
                  />
                )}
              </>
            )}

            {/* Placeholder views for other navigation items */}
            {user.role !== 'recruiter' &&
              activeView !== 'dashboard' &&
              activeView !== 'profile' &&
              activeView !== 'passport' &&
              activeView !== 'passport-settings' &&
              activeView !== 'public-passport' &&
              activeView !== 'skill-gap' &&
              activeView !== 'target-role' &&
              activeView !== 'missions' &&
              activeView !== 'simulator' &&
              activeView !== 'evaluation' &&
              activeView !== 'submissions' &&
              activeView !== 'opportunities' && (
              <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
                <div className="p-12 bg-white rounded-xl border border-zinc-200 shadow-xs space-y-3">
                  <h2 className="text-xl font-bold text-zinc-900 capitalize">
                    {activeView.replace('-', ' ')} Module
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    This module foundation is established. Deep interactive logic and simulator integration are
                    scheduled in accordance with the 60-day development roadmap.
                  </p>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer pt-2"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        /* Public / Unauthenticated Views */
        <main className="flex-1">
          {activeView === 'landing' && (
            <LandingPage
              onGetStarted={() => setActiveView('register')}
              onRecruiterLogin={() => setActiveView('login')}
              onOpenTour={() => setIsTourOpen(true)}
            />
          )}
          {(activeView === 'login' || activeView === 'register') && (
            <AuthPage
              initialMode={activeView as 'login' | 'register'}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
          {activeView === 'public-passport' && (
            <PublicPassportPage
              slug={activePublicSlug}
              onNavigateHome={() => setActiveView('landing')}
            />
          )}
        </main>
      )}

      {/* Guided Walkthrough Tour Modal */}
      <GuidedWalkthroughModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
