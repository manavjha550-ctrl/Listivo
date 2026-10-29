import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  User,
  Phone,
  FileCheck2,
  MapPin,
  Map,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ListivoLogo } from '../components/common/ListivoLogo';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [pickupPincode, setPickupPincode] = useState(user?.pickupPincode || '');
  const [pickupAddress, setPickupAddress] = useState(user?.pickupAddress || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMessage('Store / Company Name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pickupPincode.trim() || pickupPincode.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian Pincode.');
      return;
    }
    if (!pickupAddress.trim()) {
      setErrorMessage('Pickup Address is required.');
      return;
    }

    setIsSubmitting(true);

    const success = await completeOnboarding({
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      gstin: gstin.trim(),
      pickupPincode: pickupPincode.trim(),
      pickupAddress: pickupAddress.trim(),
    });

    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col font-sans antialiased">
      {/* Top Bar */}
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-[#E4E7EC] bg-white">
        <ListivoLogo variant="light" size="md" />
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <span className="w-5 h-5 rounded-full bg-[#14B8A6] text-white text-[11px] font-bold inline-flex items-center justify-center">
            1
          </span>
          <span className="text-[#101828] font-semibold">Business &amp; Pickup Setup</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start p-6 sm:p-10 my-auto">
        {/* Left Context Column */}
        <div className="lg:col-span-5 space-y-5 pt-2">
          <p className="text-xs font-semibold text-[#0F766E]">Workspace Initialization</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
            Tell us about your seller business
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Your store name, optional GSTIN, and default warehouse pickup details pre-fill reusable templates and shipping origin defaults across your catalog.
          </p>

          <div className="p-4 rounded-xl bg-white border border-[#E4E7EC] space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-medium text-[#101828]">
              <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>Editable anytime in Business &amp; GST Settings</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-[#101828]">
              <Check className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>Private to your isolated seller workspace</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
          {errorMessage && (
            <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-[#B42318] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="onb-fullname" className="block text-xs font-semibold text-[#101828]">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="onb-fullname"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onb-company" className="block text-xs font-semibold text-[#101828]">
                  Store / Company Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="onb-company"
                    type="text"
                    required
                    placeholder="Enter store or company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onb-phone" className="block text-xs font-semibold text-[#101828]">
                  Mobile Number <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E4E7EC] bg-[#F8FAFC] text-xs font-mono text-[#667085]">
                    +91
                  </span>
                  <input
                    id="onb-phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E4E7EC] rounded-r-lg text-xs font-mono text-[#101828] placeholder:text-[#98A2B3] placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onb-gstin" className="block text-xs font-semibold text-[#101828]">
                  GSTIN <span className="text-[#667085] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="onb-gstin"
                    type="text"
                    placeholder="15-character GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs font-mono uppercase text-[#101828] placeholder:text-[#98A2B3] placeholder:font-sans placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onb-pincode" className="block text-xs font-semibold text-[#101828]">
                  Pickup Pincode <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="onb-pincode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit pincode"
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs font-mono text-[#101828] placeholder:text-[#98A2B3] placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="onb-address" className="block text-xs font-semibold text-[#101828]">
                  Warehouse / Business Address <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Map className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                  <textarea
                    id="onb-address"
                    required
                    rows={2}
                    placeholder="Enter complete pickup address"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20 focus:border-[#14B8A6] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                <span>Isolated Seller Workspace</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Complete Setup &amp; Open Dashboard
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
