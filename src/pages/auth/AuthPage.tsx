import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ListivoLogo } from '../../components/common/ListivoLogo';
import { Button } from '../../components/ui/Button';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, user } = useAuth();

  const isSignupRoute = location.pathname.includes('/signup');
  const [mode, setMode] = useState<'login' | 'signup'>(isSignupRoute ? 'signup' : 'login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleInfoMsg, setGoogleInfoMsg] = useState<string | null>(null);

  // Sync mode with route changes
  useEffect(() => {
    setMode(location.pathname.includes('/signup') ? 'signup' : 'login');
    setErrorMessage(null);
  }, [location.pathname]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.profileComplete || user.isOwner) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setGoogleInfoMsg(null);

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please check your email and password.');
      }
    } else {
      const res = await signup(email, fullName, password, companyName);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create account. Please try again.');
      }
    }
  };

  const handleGoogleAuth = () => {
    setGoogleInfoMsg('Enter your workspace email below to continue with your seller account.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col lg:grid lg:grid-cols-12 font-sans antialiased">
      {/* Left Deep Navy Brand Showcase Panel */}
      <div className="lg:col-span-5 bg-[#101828] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1D2939]">
        <div className="flex items-center justify-between">
          <Link to="/">
            <ListivoLogo variant="dark" size="md" />
          </Link>
          <Link
            to="/"
            className="text-xs font-medium text-[#98A2B3] hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="py-10 lg:py-0 space-y-6 max-w-md">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#2DD4BF] tracking-wide">
              Multi-Marketplace Seller Workspace
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Structured catalog operations for Indian e-commerce sellers.
            </h2>
            <p className="text-xs sm:text-sm text-[#98A2B3] leading-relaxed">
              Manage reusable GST &amp; HSN category templates, validate bulk CSV/XLSX sheets, calculate net settlement profits, and sync ready products with the Meesho Chrome Extension.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs font-medium text-white/90">
              <div className="w-5 h-5 rounded-md bg-[#14B8A6]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Meesho, Flipkart, Amazon India &amp; Myntra templates</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-white/90">
              <div className="w-5 h-5 rounded-md bg-[#14B8A6]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Strict multi-tenant seller data &amp; pricing isolation</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-white/90">
              <div className="w-5 h-5 rounded-md bg-[#14B8A6]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Smart Listing AI, Keyword Intelligence &amp; Margin Modeler</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-[#98A2B3]">
          <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
          <span>Encrypted session tokens · Isolated seller catalog</span>
        </div>
      </div>

      {/* Right Authentication Form Canvas */}
      <main className="lg:col-span-7 flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white border border-[#E4E7EC] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 bg-[#F8FAFC] p-1 rounded-lg border border-[#E4E7EC]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                navigate('/auth/login', { replace: true });
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#101828] shadow-2xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                navigate('/auth/signup', { replace: true });
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#101828] shadow-2xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#101828]">
              {mode === 'login' ? 'Welcome back' : 'Create your seller account'}
            </h1>
            <p className="text-xs text-[#667085]">
              {mode === 'login'
                ? 'Sign in to access your catalog templates, listings, and tools.'
                : 'Set up your isolated LISTIVO workspace in under two minutes.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-[#B42318] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {googleInfoMsg && (
            <div className="p-3 bg-[#ECFDF3] border border-[#ABEFC6] rounded-lg text-[#067647] text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>{googleInfoMsg}</span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="auth-fullname" className="block text-xs font-semibold text-[#101828]">
                    Full Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-fullname"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auth-company" className="block text-xs font-semibold text-[#101828]">
                    Store / Company Name <span className="text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-company"
                      type="text"
                      placeholder="Enter your store or business name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block text-xs font-semibold text-[#101828]">
                Email Address <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#101828]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#667085] hover:text-[#101828] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Free Account'}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E4E7EC] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#667085] font-medium absolute">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg font-semibold text-xs text-[#101828] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.8-.5-1.6-.5-2.3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-[#667085]">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    navigate('/auth/signup', { replace: true });
                  }}
                  className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    navigate('/auth/login', { replace: true });
                  }}
                  className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
};
