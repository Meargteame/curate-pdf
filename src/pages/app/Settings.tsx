import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Save, 
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { getStoredDocuments, getStoredBrandKit } from '../../utils/storage';

export const Settings: React.FC<{ onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void }> = ({ onShowToast }) => {
  const [profileName, setProfileName] = useState('Sarah Jenkins');
  const [profileEmail, setProfileEmail] = useState('sarah.jenkins@acme-advisory.example.com');
  const [workspaceName, setWorkspaceName] = useState('Acme Advisory Group');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [batchAlerts, setBatchAlerts] = useState(true);

  const handleSave = () => {
    if (onShowToast) {
      onShowToast('Settings Saved', 'Workspace preferences have been updated.', 'success');
    }
  };

  const handleExportWorkspace = () => {
    const backup = {
      brandKit: getStoredBrandKit(),
      documents: getStoredDocuments(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curatepdf_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('Data Exported', 'Workspace JSON backup saved.', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Workspace Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your account profile, workspace configuration, and notifications
        </p>
      </div>

      {/* User Profile */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
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
            label="Work Email"
            type="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Workspace Details */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-forest" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Workspace Configuration
          </h3>
        </div>

        <div className="space-y-3">
          <Input
            label="Workspace Name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <div className="text-xs text-slate-500 bg-paper-subtle p-3 rounded-lg border border-paper-border">
            Workspace URL slug: <span className="font-mono font-semibold text-ink">curatepdf.site/acme</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-forest" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Automation & Email Alerts
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

      {/* Data Backup & Export */}
      <div className="bg-white p-5 rounded-card border border-paper-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-forest" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest font-display">
            Workspace Data & Portability
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Export your complete workspace including custom templates, saved documents, and Brand Kit configuration as a portable JSON file.
        </p>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportWorkspace}
            leftIcon={<Download className="w-3.5 h-3.5 text-forest" />}
          >
            Export All Workspace Data (.JSON)
          </Button>
        </div>
      </div>

      {/* Save action button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
