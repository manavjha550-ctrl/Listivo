import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/auth/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { CreateTemplatePage } from './pages/CreateTemplatePage';
import { EditTemplatePage } from './pages/EditTemplatePage';
import { ListingsPage } from './pages/ListingsPage';
import { ListingForm } from './features/listings/components/ListingForm';
import { BulkPage } from './pages/BulkPage';
import { KeywordsPage } from './pages/KeywordsPage';
import { ToolsPage } from './pages/ToolsPage';
import { ImageMakerPage } from './pages/ImageMakerPage';
import { PriceCalculatorPage } from './pages/PriceCalculatorPage';
import { SmartListingsPage } from './pages/SmartListingsPage';
import { TutorialsPage } from './pages/TutorialsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TeamPage } from './pages/TeamPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected SaaS Dashboard Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#667085] text-xs gap-3 font-sans">
        <div className="w-8 h-8 border-2 border-[#E4E7EC] border-t-[#14B8A6] rounded-full animate-spin" />
        <span className="font-medium text-[#101828]">Authenticating Listivo workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect un-onboarded sellers to /onboarding
  if (user && !user.isOwner && user.profileComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding Route Wrapper (Only accessible if logged in but profile incomplete)
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#667085] text-xs gap-3 font-sans">
        <div className="w-8 h-8 border-2 border-[#E4E7EC] border-t-[#14B8A6] rounded-full animate-spin" />
        <span className="font-medium text-[#101828]">Loading seller profile...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && (user.profileComplete || user.isOwner)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/signup" element={<AuthPage />} />

          {/* Protected Onboarding Flow */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          {/* Protected SaaS App Shell Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/new" element={<CreateTemplatePage />} />
            <Route path="/templates/:id" element={<EditTemplatePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/new" element={<ListingForm />} />
            <Route path="/listings/:id" element={<ListingForm />} />
            <Route path="/bulk" element={<BulkPage />} />
            <Route path="/keyword-research" element={<KeywordsPage />} />
            <Route path="/keywords" element={<Navigate to="/keyword-research" replace />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/image-maker" element={<ImageMakerPage />} />
            <Route path="/price-calculator" element={<PriceCalculatorPage />} />
            <Route path="/smart-listings" element={<SmartListingsPage />} />
            <Route path="/tutorials" element={<TutorialsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
