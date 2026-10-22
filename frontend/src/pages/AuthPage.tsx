import React, { useState, type ChangeEvent } from 'react';
import { ShieldCheck, Mail, Lock, User, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { setAuthSession } from '../utils/auth';
import { apiUrl } from '../utils/api';

export interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (userData: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password, name, role, ...(role === 'recruiter' && { companyName }) };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Authentication request failed');
      }

      // Store tokens and session canonically
      if (data.data?.tokens) {
        setAuthSession({
          tokens: data.data.tokens,
          user: data.data.user,
        });
      }

      onAuthSuccess(data.data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-zinc-50">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            {mode === 'login' ? 'Sign in to WorkProof AI' : 'Create your WorkProof account'}
          </h2>
          <p className="text-xs text-zinc-500">
            {mode === 'login'
              ? 'Access your Proof-of-Work Passport & active missions'
              : 'Join as a first-time coder or verified technical hiring recruiter'}
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 pb-2 border-b border-zinc-100">
            <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'login' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'register' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Register
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`p-2.5 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          role === 'student'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <User className={`w-4 h-4 ${role === 'student' ? 'text-blue-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-xs font-semibold">Candidate</p>
                          <p className="text-[10px] text-zinc-500">Student / Coder</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('recruiter')}
                        className={`p-2.5 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          role === 'recruiter'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <Building2 className={`w-4 h-4 ${role === 'recruiter' ? 'text-blue-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-xs font-semibold">Recruiter</p>
                          <p className="text-[10px] text-zinc-500">Employer / Team</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Full Name"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                    leftIcon={<User className="w-4 h-4" />}
                  />

                  {role === 'recruiter' && (
                    <Input
                      label="Company Name"
                      placeholder="e.g. Acme Tech"
                      value={companyName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                      required
                      leftIcon={<Building2 className="w-4 h-4" />}
                    />
                  )}
                </>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
                helperText={mode === 'register' ? 'Minimum 8 characters' : undefined}
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
                {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
