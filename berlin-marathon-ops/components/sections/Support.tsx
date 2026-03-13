'use client';

import { useState } from 'react';
import { Heart, Coffee, MessageSquare, Send, Shield } from 'lucide-react';
import config from '@/data/config.json';

export default function Support() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        window.location.href = `mailto:?subject=Berlin Marathon Ops Feedback&body=${encodeURIComponent(formData.message)}`;
      }
      setSubmitting(false);
    } else {
      window.location.href = `mailto:?subject=Berlin Marathon Ops Feedback&body=${encodeURIComponent(
        `From: ${formData.name} (${formData.email})\n\n${formData.message}`
      )}`;
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center gap-2">
          <Heart size={28} className="text-[var(--accent)]" />
          Support This Guide
        </h2>
        <p className="text-base text-[var(--text-secondary)]">
          This guide is free, open-source, and community-driven. Help make it better.
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
              <p className="text-sm text-[var(--text-muted)]">Support the research behind this guide</p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] mb-4">
            Building and maintaining this guide requires significant research, verification, and development time. If you found it useful, consider buying me a coffee.
          </p>
          <a
            href={config.buyMeCoffeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm transition-colors"
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
              <p className="text-sm text-[var(--text-muted)]">Share your Berlin Marathon experience</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
              Thank you for your feedback! Your intel helps make this guide better for everyone.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <textarea
                placeholder="Your intel, correction, or restaurant tip..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-press inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Privacy — one sentence */}
      <div className="mt-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Shield size={14} className="flex-shrink-0" />
        <p>Your saved items and preferences stay on your device. We don&apos;t track you.</p>
      </div>
    </div>
  );
}
