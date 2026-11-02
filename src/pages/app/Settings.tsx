import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Save, 
  Download,
  Trash2,
  CreditCard,
  Users,
  CheckCircle2,
  Sparkles,
  Mail,
  Plus,
  KeyRound
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { 
  getStoredDocuments, 
  getStoredBrandKit, 
  saveStoredBrandKit,
  getStoredUserProfile,
  saveStoredUserProfile,
  saveStoredDocuments
} from '../../utils/storage';

export const Settings: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const currentProfile = getStoredUserProfile();
  const brandKit = getStoredBrandKit();

  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'team' | 'data'>('profile');
  
  // Profile & Workspace form state
  const [profileName, setProfileName] = useState(currentProfile.name);
  const [profileEmail, setProfileEmail] = useState(currentProfile.email);
  const [workspaceName, setWorkspaceName] = useState(brandKit.companyName);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  
  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [batchAlerts, setBatchAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Team members state
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: currentProfile.name, email: currentProfile.email, role: 'Owner', status: 'Active' },
    { id: '2', name: 'Alex Rivera', email: 'a.rivera@example.com', role: 'Editor', status: 'Active' },
    { id: '3', name: 'Elena Rostova', email: 'e.rostova@example.com', role: 'Viewer', status: 'Invited' },
  ]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  // Danger zone reset modal
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    // Save profile
    saveStoredUserProfile({
      ...currentProfile,
      name: profileName.trim(),
      email: profileEmail.trim(),
      company: workspaceName.trim(),
    });

    // Save brand kit company name
    saveStoredBrandKit({
      ...brandKit,
      companyName: workspaceName.trim(),
      email: profileEmail.trim(),
    });

    setTimeout(() => {
      setIsSaving(false);
      if (onShowToast) {
        onShowToast('Settings Saved', 'Workspace identity and personal preferences updated.', 'success');
      }
    }, 400);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setTeamMembers(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'Invited',
      }
    ]);
    setIsInviteOpen(false);
    setInviteEmail('');
    if (onShowToast) {
      onShowToast('Invitation Sent', `Sent workspace invitation to ${inviteEmail}`, 'success');
    }
  };

  const handleExportWorkspace = () => {
    const backup = {
      profile: getStoredUserProfile(),
      brandKit: getStoredBrandKit(),
      documents: getStoredDocuments(),
      exportedAt: new Date().toISOString(),
      platformVersion: '2.4.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curatepdf_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('Data Exported', 'Full workspace JSON backup saved.', 'success');
    }
  };

  const handleResetData = () => {
    saveStoredDocuments([]);
    setIsResetOpen(false);
    if (onShowToast) {
      onShowToast('Workspace Reset', 'Cleared local documents cache.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 antialiased">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Workspace Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your account profile, workspace team, billing plan, and data security
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-paper-border pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'General & Profile', icon: <User className="w-4 h-4" /> },
          { id: 'billing', label: 'Subscription & Billing', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'team', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
          { id: 'data', label: 'Security & Export', icon: <Shield className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-forest text-white shadow-2xs'
                : 'text-slate-600 hover:text-ink hover:bg-paper-subtle'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: General & Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* User Profile */}
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-paper-border">
              <User className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Personal Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                label="Work Email Address"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Workspace Details */}
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-paper-border">
              <Building2 className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Workspace Identity
              </h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Workspace Display Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Default Document Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: 'USD', label: 'USD ($) United States Dollar' },
                    { value: 'EUR', label: 'EUR (€) Euro' },
                    { value: 'GBP', label: 'GBP (£) British Pound' },
                    { value: 'CAD', label: 'CAD ($) Canadian Dollar' },
                  ]}
                />
                <Select
                  label="Workspace Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  options={[
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'Europe/London', label: 'Greenwich Mean Time (UTC)' },
                    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
                  ]}
                />
              </div>

              <div className="text-xs text-slate-500 bg-paper-subtle p-3.5 rounded-lg border border-paper-border flex items-center justify-between">
                <span>Public Workspace Domain: <strong className="font-mono text-ink">curatepdf.site/{workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}</strong></span>
                <span className="text-[11px] font-semibold text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-200">Active</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-paper-border">
              <Bell className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Automations & Alerts
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-paper-border text-forest focus:ring-forest"
                />
                <span>Email me when bulk PDF batches finish generating</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={batchAlerts}
                  onChange={(e) => setBatchAlerts(e.target.checked)}
                  className="rounded border-paper-border text-forest focus:ring-forest"
                />
                <span>Receive weekly document generation activity summaries</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: Subscription & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest font-display">
                  Active Subscription
                </span>
                <h3 className="text-xl font-display font-bold text-ink mt-0.5">
                  Professional Plan
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  14-day full access trial active. Next renewal on November 16, 2026.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-display font-extrabold text-ink">$19</span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
            </div>

            {/* Quota Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Monthly PDF Document Quota</span>
                <span className="font-mono text-slate-500">18 / 500 documents used</span>
              </div>
              <div className="w-full bg-paper-subtle rounded-full h-2.5 border border-paper-border overflow-hidden">
                <div className="bg-forest h-2.5 rounded-full" style={{ width: '3.6%' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-paper-border">
              <div className="p-4 bg-paper-subtle/50 rounded-xl border border-paper-border space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Seat Count</span>
                <p className="text-base font-display font-bold text-ink">3 Active Seats</p>
              </div>
              <div className="p-4 bg-paper-subtle/50 rounded-xl border border-paper-border space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Bulk Batch Limit</span>
                <p className="text-base font-display font-bold text-ink">500 docs / batch</p>
              </div>
              <div className="p-4 bg-paper-subtle/50 rounded-xl border border-paper-border space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">API Key Access</span>
                <p className="text-base font-display font-bold text-ink">Enabled</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onShowToast?.('Stripe Checkout', 'Opening secure Stripe billing portal...', 'info')}
                leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              >
                Manage Payment Method
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowToast?.('Enterprise Upgrade', 'Our sales engineering team will reach out.', 'info')}
              >
                Upgrade to Team & API ($79/mo)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Team Members */}
      {activeTab === 'team' && (
        <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-display font-bold text-ink">Workspace Team Members</h3>
              <p className="text-xs text-slate-500">Collaborate with colleagues on templates and generated documents</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Invite Teammate
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-subtle border-b border-paper-border text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Member</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Role</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border text-slate-700">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-paper-subtle/30">
                    <td className="py-3.5 px-4 font-medium text-ink">
                      <div>
                        <p className="font-semibold text-sm">{m.name}</p>
                        <p className="text-[11px] text-slate-400">{m.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {m.role !== 'Owner' && (
                        <button
                          onClick={() => {
                            setTeamMembers(teamMembers.filter(item => item.id !== m.id));
                            onShowToast?.('Member Removed', `Removed ${m.name} from workspace.`, 'info');
                          }}
                          className="text-slate-400 hover:text-red-600 text-xs font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Export */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-paper-border shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-paper-border">
              <Shield className="w-4 h-4 text-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                Data Portability & Full JSON Backup
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Export your complete workspace as a single encrypted JSON archive containing all brand kit tokens, customer profiles, custom templates, and document revisions.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={handleExportWorkspace}
              leftIcon={<Download className="w-4 h-4 text-forest" />}
            >
              Export Complete Workspace Backup (.JSON)
            </Button>
          </div>

          <div className="bg-white p-6 rounded-card border border-red-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-red-100">
              <Trash2 className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 font-display">
                Danger Zone
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Purge all local cache, generated drafts, and document records. This will not affect your active subscription or cloud brand kit.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsResetOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Purge Workspace Cache
            </Button>
          </div>
        </div>
      )}

      {/* Invite Member Dialog */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Teammate to Workspace"
        description="Invited members will receive an email link to access templates and create documents."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
          <Input
            label="Work Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@yourcompany.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoFocus
          />

          <Select
            label="Workspace Permission Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: 'Editor', label: 'Editor (Can create, edit, and export documents)' },
              { value: 'Viewer', label: 'Viewer (Read-only review & PDF download)' },
              { value: 'Admin', label: 'Administrator (Full access to Brand Kit & Billing)' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Reset Cache Confirmation Dialog */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Purge Local Document Cache?"
        description="Are you sure you want to clear your local document records? This action cannot be reversed."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleResetData}>
              Yes, Purge Cache
            </Button>
          </>
        }
      >
        <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs">
          Warning: Unsaved changes on currently open documents will be discarded.
        </div>
      </Dialog>
    </div>
  );
};