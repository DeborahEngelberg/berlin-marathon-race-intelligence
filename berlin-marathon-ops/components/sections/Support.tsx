'use client';

import { useState } from 'react';
import { Heart, Coffee, MessageSquare, Send, Download, Shield } from 'lucide-react';
import { exportAnalyticsCSV } from '@/lib/store';
import config from '@/data/config.json';

export default function Support() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If Formspree endpoint is configured, use it
    if (config.formspreeEndpoint && !config.formspreeEndpoint.includes('YOUR_FORM_ID')) {
      setSubmitting(true);
      try {
        const res = await fetch(config.formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setSubmitted(true);
          setFormData({ name: '', email: '', message: '' });
        }
      } catch {
        // Fallback to mailto
        window.location.href = `mailto:?subject=Berlin Marathon Ops Feedback&body=${encodeURIComponent(formData.message)}`;
      }
      setSubmitting(false);
    } else {
      // Mailto fallback
      window.location.href = `mailto:?subject=Berlin Marathon Ops Feedback&body=${encodeURIComponent(
        `From: ${formData.name} (${formData.email})\n\n${formData.message}`
      )}`;
      setSubmitted(true);
    }
  };

  const handleExportAnalytics = () => {
    const csv = exportAnalyticsCSV();
    if (!csv || csv.split('\n').length <= 1) {
      alert('No analytics data collected yet.');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `berlin-marathon-ops-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <Heart size={22} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="section-header">Support</h2>
        </div>
        <p className="section-description max-w-3xl">
          This guide is free, open-source, and community-driven. If you found it useful, you can support the research behind it or contribute your own experience to help future runners and spectators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Me a Coffee */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Coffee size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">Buy Me a Coffee</h3>
              <p className="text-xs text-[var(--text-muted)]">Support the research behind this guide</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Building and maintaining this guide requires significant research, verification, and development time. If you found it useful, consider buying me a coffee.
          </p>
          <a
            href={config.buyMeCoffeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm transition-colors"
          >
            <Coffee size={16} />
            Buy Me a Coffee
          </a>
        </div>

        {/* Feedback Form */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">Contribute Intel</h3>
              <p className="text-xs text-[var(--text-muted)]">Share your Berlin Marathon experience</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              Thank you for your feedback! Your intel helps make this guide better for everyone.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <textarea
                placeholder="Your intel, correction, or restaurant tip..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 card p-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm text-[var(--text)] mb-1">Privacy</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              This site stores your preferences (theme, saved items) locally in your browser using localStorage. No data is sent to any server except when you explicitly submit the feedback form. The feedback form uses{' '}
              {config.formspreeEndpoint.includes('YOUR_FORM_ID') ? (
                'a mailto: fallback (no external service configured)'
              ) : (
                <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Formspree</a>
              )}{' '}
              to deliver your message. No analytics are collected unless explicitly enabled in configuration. If local analytics are enabled, they are stored entirely in your browser and never transmitted.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Export (for site owner) */}
      <div className="mt-4 card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm text-[var(--text)]">Local Analytics</h4>
            <p className="text-xs text-[var(--text-muted)]">
              Export locally collected usage data as CSV. Data never leaves your browser.
            </p>
          </div>
          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Formspree Setup Instructions */}
      {config.formspreeEndpoint.includes('YOUR_FORM_ID') && (
        <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-sm text-yellow-700 dark:text-yellow-400 mb-1">Setup Note: Feedback Form</h4>
          <p className="text-xs text-yellow-600 dark:text-yellow-300">
            The feedback form is using a mailto: fallback. To enable direct submission, sign up for a free{' '}
            <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">Formspree</a>{' '}
            account, create a form, and replace <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 py-0.5 rounded">YOUR_FORM_ID_HERE</code> in{' '}
            <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 py-0.5 rounded">data/config.json</code> with your form ID.
          </p>
        </div>
      )}
    </div>
  );
}
