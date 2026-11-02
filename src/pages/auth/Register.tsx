import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Building2, User, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getStoredBrandKit, saveStoredBrandKit, saveStoredUserProfile } from '../../utils/storage';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userName = name.trim() || 'Workspace Admin';
    const orgName = company.trim() || 'My Organization';
    const userEmail = email.trim() || 'admin@example.com';

    // Update user profile in storage
    saveStoredUserProfile({
      name: userName,
      email: userEmail,
      company: orgName,
      role: 'Workspace Administrator',
      plan: 'pro',
      planStatus: 'Active (14-day Pro Trial)',
      documentsQuota: 500,
    });

    // Update BrandKit company name
    const currentBrand = getStoredBrandKit();
    saveStoredBrandKit({
      ...currentBrand,
      companyName: orgName,
      email: userEmail,
    });

    setTimeout(() => {
      setIsLoading(false);
      navigate('/app');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <NavLink to="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="xl" />
        </NavLink>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
          Create your CuratePDF workspace
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <NavLink to="/login" className="font-semibold text-forest hover:underline">
            Sign in
          </NavLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-paper-border shadow-doc-lg space-y-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
            <Input
              label="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Organization or Business Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Advisory Group"
              leftIcon={<Building2 className="w-4 h-4" />}
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Create Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="text-xs text-slate-600 bg-forest-50/60 p-3.5 rounded-xl border border-forest-100/80 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Includes 14-day full access trial of Professional features. No credit card required.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full justify-center h-12 text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg mt-1"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Organization Workspace
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            By creating an account, you agree to CuratePDF's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};