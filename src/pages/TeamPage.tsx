import React, { useState } from 'react';
import { UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Catalog Operator';
  status: 'Active' | 'Pending Invite';
}

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner' || user?.plan === 'lifetime_free' || user?.isOwner;

  const [invitedMembers, setInvitedMembers] = useState<WorkspaceMember[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Catalog Operator'>('Catalog Operator');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const primaryMember: WorkspaceMember = {
    id: user?.id || 'primary-user',
    name: user?.fullName || 'Seller Account Holder',
    email: user?.email || '—',
    role: isOwner ? 'Owner' : 'Admin',
    status: 'Active',
  };

  const allMembers = [primaryMember, ...invitedMembers];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: WorkspaceMember = {
      id: `inv-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      status: 'Pending Invite',
    };

    setInvitedMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setIsInviteOpen(false);
    setBannerMsg(
      `Recorded workspace invite for ${newMember.email} (${newMember.role}). Outbound email delivery requires SMTP configuration.`
    );
  };

  const handleRevokeInvite = (id: string) => {
    setInvitedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Team & Permissions</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Manage catalog operators and workspace role assignments for your seller account.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Invite Member
        </Button>
      </div>

      {bannerMsg && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[#14B8A6]/30 bg-[#14B8A6]/10 text-xs text-[#101828]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>{bannerMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="text-xs font-medium text-[#667085] hover:text-[#101828]"
          >
            Dismiss
          </button>
        </div>
      )}

      <Card padding="none" className="overflow-hidden border-[#E4E7EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#475467] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Workspace Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {allMembers.map((member, idx) => (
                <tr key={member.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#101828]">{member.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[#667085]">{member.email}</td>
                  <td className="py-3.5 px-4 font-medium text-[#101828]">{member.role}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        member.status === 'Active' ? 'text-[#0F766E]' : 'text-amber-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {idx > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(member.id)}
                        className="p-1.5 text-[#667085] hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Revoke invite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#98A2B3]">Primary</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Workspace Operator"
        subtitle="Add a catalog manager or listing operator to your team roster."
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="e.g. Priya Verma"
          />
          <Input
            label="Work Email"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="operator@store.in"
          />
          <div>
            <label className="block text-xs font-semibold text-[#101828] mb-1.5">Role Assignment</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="Catalog Operator">Catalog Operator (Templates & Listings)</option>
              <option value="Admin">Workspace Admin (Full Catalog & Bulk Access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Record Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
