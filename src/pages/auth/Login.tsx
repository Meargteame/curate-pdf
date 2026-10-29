import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('sarah.jenkins@acme-advisory.example.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <NavLink to="/" className="inline-block">
          <Logo size="xl" />
        </NavLink>
        <h2 className="text-2xl font-display font-bold text-ink">
          Sign in to your workspace
        </h2>
        <p className="text-xs text-slate-500">
          Or{' '}
          <NavLink to="/register" className="font-semibold text-forest hover:underline">
            create a new organization account
          </NavLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-paper-border shadow-doc-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-paper-border text-forest focus:ring-forest" />
                <span>Remember me</span>
              </label>
              <span className="text-forest hover:underline cursor-pointer">Forgot password?</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Workspace Demo
            </Button>
          </form>

          <div className="pt-4 border-t border-paper-border text-center">
            <div className="p-3 bg-paper-subtle rounded-lg border border-paper-border text-xs text-slate-600">
              <p className="font-semibold text-ink">Frontend Showcase Environment</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Clicking Sign In immediately loads your configured local workspace and sample documents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
