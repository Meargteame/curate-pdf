import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ChevronDown, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getStoredUserProfile, saveStoredUserProfile } from '../../utils/storage';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      priceMonthly: '$0',
      priceAnnual: '$0',
      period: 'forever',
      description: 'Ideal for freelancers and individuals creating occasional professional documents.',
      features: [
        'Unlimited client-side PDF downloads',
        'Standard document templates',
        'Custom brand color & logo support',
        'Interactive real-time preview canvas',
        'Local browser document storage',
      ],
      cta: 'Get started for free',
      variant: 'secondary' as const,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      priceMonthly: '$19',
      priceAnnual: '$15',
      period: 'per month',
      description: 'Built for independent consultants, agencies, and small business operations.',
      features: [
        'Everything in Free Starter',
        'All 8 premium template layouts',
        'Bulk generation engine (CSV / JSON)',
        'Up to 500 batch documents per job',
        'Advanced brand typography tokens',
        'Watermark-free high-DPI rasterization',
      ],
      cta: 'Start 14-day free trial',
      variant: 'primary' as const,
      popular: true,
    },
    {
      id: 'team',
      name: 'Team & API',
      priceMonthly: '$79',
      priceAnnual: '$63',
      period: 'per month',
      description: 'For growing teams and engineering departments automating recurring workflows.',
      features: [
        'Everything in Professional',
        'Full REST API access & API keys',
        'Unlimited bulk generation batches',
        'Multiple workspace seats & shared Brand Kit',
        'Audit logs and webhook notifications',
        'Dedicated SLA & developer support',
      ],
      cta: 'Create team workspace',
      variant: 'secondary' as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'Do generated PDFs contain any watermarks?',
      a: 'No. All PDFs generated on CuratePDF—including on the free tier—are 100% clean, professional, and free of any watermarks or platform badges.',
    },
    {
      q: 'How does client-side PDF rendering protect my data?',
      a: 'When you create and download documents in your browser, your financial figures, client addresses, and contract terms are converted directly into PDF vectors on your own machine without being stored or transmitted to unnecessary external servers.',
    },
    {
      q: 'Can I export or backup my workspace documents?',
      a: 'Yes. Under Workspace Settings you can export all your saved documents, custom fields, and Brand Kit configuration as a single portable JSON file at any time.',
    },
    {
      q: 'Can I automate document generation through an API?',
      a: 'Yes. The Team & API tier includes secret API keys and code snippets in curl, Node.js, and Python to trigger automated rendering from your backend applications.',
    },
    {
      q: 'Can I cancel or change plans anytime?',
      a: 'Yes. There are no lock-in contracts or termination fees. You can switch plans or cancel directly in your workspace settings at any time with one click.',
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const profile = getStoredUserProfile();
    saveStoredUserProfile({
      ...profile,
      plan: planId as any,
      planStatus: planId === 'free' ? 'Starter Free' : planId === 'pro' ? 'Active (14-day Pro Trial)' : 'Team & API Tier',
    });
    navigate('/app');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 space-y-16 antialiased">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink tracking-tight">
          Choose the right plan for your document workflow
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          No hidden fees, no seat lock-ins, and no watermarks. Upgrade or downgrade whenever your operations change.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-forest' : 'text-slate-400'}`}>Monthly billing</span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-slate-200 rounded-full p-0.5 transition-colors relative focus:outline-hidden"
          >
            <div
              className={`w-5 h-5 rounded-full bg-forest shadow-md transition-transform duration-200 ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${isAnnual ? 'text-forest' : 'text-slate-400'}`}>Annual billing</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 bg-white border flex flex-col justify-between transition-all ${
              plan.popular
                ? 'border-forest ring-2 ring-forest/20 shadow-doc-lg relative'
                : 'border-paper-border shadow-card hover:border-slate-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-forest text-mint font-display font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold text-ink">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-extrabold text-ink">
                  {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className="text-xs text-slate-400 font-medium">/{plan.period}</span>
              </div>

              <div className="pt-4 border-t border-paper-border space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                  What's included:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-paper-border">
              <Button
                variant={plan.variant}
                size="md"
                className="w-full justify-center"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Redesigned 2-Column FAQ Section */}
      <div className="pt-16 border-t border-paper-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Context & Support Card */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-forest font-display">
                FAQ & Clarifications
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Clear answers about client-side vector compilation, enterprise brand kits, commercial licensing, and developer REST APIs.
              </p>
            </div>

            {/* Enterprise Support Callout */}
            <div className="bg-forest-50/70 p-5 rounded-2xl border border-forest-100/80 space-y-3">
              <div className="flex items-center gap-2 text-forest font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Custom Terms</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Need volume licensing, custom on-premise deployments, or custom vector template design for your team?
              </p>
              <button
                type="button"
                onClick={() => alert('Enterprise sales inquiries: sales@curatepdf.site')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-900 transition-colors cursor-pointer"
              >
                <span>Talk to enterprise sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Unified Sleek Accordion */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-paper-border shadow-card divide-y divide-paper-border overflow-hidden">
              {faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={i} className="transition-colors hover:bg-slate-50/40">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <span className={`text-base font-display font-semibold transition-colors ${
                        isOpen ? 'text-forest' : 'text-ink'
                      }`}>
                        {faq.q}
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 ${
                        isOpen 
                          ? 'bg-forest text-white border-forest rotate-180 shadow-2xs' 
                          : 'bg-paper-subtle text-slate-500 border-paper-border hover:border-slate-300'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 sm:px-8 pb-6 text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};