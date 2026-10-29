import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, AlertCircle, ShieldCheck, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [pickupAddress, setPickupAddress] = useState(user?.pickupAddress || '');
  const [pickupPincode, setPickupPincode] = useState(user?.pickupPincode || '');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setCompanyName(user.companyName || '');
      setPhone(user.phone || '');
      setGstin(user.gstin || '');
      setPickupAddress(user.pickupAddress || '');
      setPickupPincode(user.pickupPincode || '');
    }
  }, [user]);

  const isOwner = user?.role === 'owner' || user?.plan === 'lifetime_free' || user?.isOwner;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!fullName.trim() || !companyName.trim()) {
      setFeedback({ type: 'error', message: 'Full name and business name are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const ok = await completeOnboarding({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        gstin: gstin.trim().toUpperCase(),
        pickupPincode: pickupPincode.trim(),
        pickupAddress: pickupAddress.trim(),
      });

      if (ok) {
        setFeedback({ type: 'success', message: 'Business & GST profile saved to your workspace.' });
      } else {
        setFeedback({ type: 'error', message: 'Unable to save profile changes. Please verify your inputs.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="border-b border-[#E4E7EC] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">
          Account & Business Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Manage your seller legal identity, GSTIN defaults, dispatch warehouse address, and workspace plan.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs ${
            feedback.type === 'success'
              ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#101828]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile & Business Details */}
        <Card title="Business & GST Profile" className="lg:col-span-2 border-[#E4E7EC]">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Authorized Contact Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Store / Legal Entity Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter registered store or company name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98XXXXXXXX"
                className="font-mono tabular-nums"
              />
              <Input
                label="GSTIN (Optional)"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="15-character GSTIN"
                maxLength={15}
                className="font-mono uppercase tracking-wider"
              />
            </div>

            <Input
              label="Dispatch Warehouse / Pickup Address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Street, industrial area, city, state"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dispatch Pincode"
                value={pickupPincode}
                onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                maxLength={6}
                className="font-mono tabular-nums"
              />
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">Account Email</label>
                <div className="px-3.5 py-2 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] text-xs font-mono text-[#667085] truncate">
                  {user?.email || '—'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E7EC] flex items-center justify-end">
              <Button type="submit" variant="teal" size="sm" isLoading={isSaving}>
                Save Business Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Subscription / Entitlement Card */}
        <div className="space-y-4">
          <Card title="Workspace Entitlement" className="border-[#E4E7EC]">
            {isOwner ? (
              <div className="p-4 bg-[#101828] text-white rounded-xl border border-[#1D2939] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-white">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Owner Lifetime Access</span>
                </div>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  Unrestricted access across all catalog templates, listings, bulk spreadsheets, copy studio, and
                  Chrome extension autofill.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-[#98A2B3]">Status</span>
                  <span className="font-semibold text-[#14B8A6]">Active · Lifetime Free</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#101828] capitalize">
                    {(user?.plan || 'Starter').replace('_', ' ')} Plan
                  </span>
                  <span className="text-xs font-semibold text-[#0F766E]">Active</span>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Includes reusable marketplace templates, structured product listings, price settlement calculator,
                  and Meesho Chrome Extension autofill.
                </p>
                <div className="pt-2 border-t border-[#E4E7EC] text-[11px] text-[#667085] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span>Tenant-isolated seller workspace</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="border-[#E4E7EC] bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#101828]">
              <Building2 className="w-4 h-4 text-[#0F766E]" />
              <span>Data Isolation</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Your templates, SKU pricing rules, and Chrome Extension session tokens are scoped strictly to your
              authenticated seller account.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
