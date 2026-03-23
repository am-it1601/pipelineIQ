'use client';

import { useState, useRef, useEffect } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile, User, LeadStatus, LeadSource, BidType, EngagementType } from '@/lib/types';
import { format } from 'date-fns';
import { X, Save, PlusCircle, Zap } from 'lucide-react';

const LEAD_SOURCES: LeadSource[]   = ['Upwork', 'Referral', 'LinkedIn', 'Direct'];
const BID_TYPES: BidType[]         = ['Normal', 'Boosted'];
const ENGAGEMENT_TYPES: EngagementType[] = ['Fixed', 'Hourly'];
const STATUSES: LeadStatus[] = ['Submitted', 'Viewed', 'Discussion', 'Follow Up', 'Waiting Client', 'Won', 'Lost'];

type FormData = Omit<LeadLogEntry, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  user: User;
  members: BDMember[];
  profiles: UpworkProfile[];
  onAdd: (data: FormData) => Promise<void>;
  onClose: () => void;
}

function empty(user: User): FormData {
  return {
    date: format(new Date(), 'yyyy-MM-dd'),
    projectTitle: '',
    leadSource: 'Upwork',
    upworkLink: '',
    profileUsedId: '',
    assignedToId: user.bdMemberId ?? user.id,
    engagementType: 'Fixed',
    proposalValue: 0,
    hourlyRate: undefined,
    estimatedHours: undefined,
    connectsUsed: 6,
    bidType: 'Normal',
    status: 'Submitted',
    remarks: '',
    createdByUserId: user.id,
    updatedByUserId: user.id,
  };
}

export default function QuickAddForm({ user, members, profiles, onAdd, onClose }: Props) {
  const [form, setForm] = useState<FormData>(empty(user));
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  // Keyboard shortcut: Escape = close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const patch = (field: keyof FormData, val: string | number | undefined) => {
    setForm((f) => {
      const next = { ...f, [field]: val };
      // Auto-compute proposalValue for hourly bids whenever rate or hours change
      if ((field === 'hourlyRate' || field === 'estimatedHours') && next.engagementType === 'Hourly') {
        next.proposalValue = (next.hourlyRate ?? 0) * (next.estimatedHours ?? 0);
      }
      return next;
    });
  };

  const patchEngagement = (et: EngagementType) => {
    setForm((f) => ({
      ...f,
      engagementType: et,
      // Reset hourly fields when switching to Fixed
      hourlyRate: et === 'Fixed' ? undefined : f.hourlyRate,
      estimatedHours: et === 'Fixed' ? undefined : f.estimatedHours,
      proposalValue: et === 'Fixed' ? f.proposalValue : (f.hourlyRate ?? 0) * (f.estimatedHours ?? 0),
    }));
  };

  const handleSave = async (andNew: boolean) => {
    if (!form.projectTitle.trim()) { titleRef.current?.focus(); return; }
    if (form.engagementType === 'Hourly' && (!form.hourlyRate || !form.estimatedHours)) return;
    setSaving(true);
    try {
      await onAdd(form);
      setAdded((n) => n + 1);
      if (andNew) {
        setForm({ ...empty(user), assignedToId: form.assignedToId, leadSource: form.leadSource, bidType: form.bidType, engagementType: form.engagementType });
        setTimeout(() => titleRef.current?.focus(), 50);
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '9px 12px',
    fontSize: 13,
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 5,
    display: 'block',
  };

  const toggleBtn = (active: boolean, color: string): React.CSSProperties => ({
    flex: 1, padding: '8px', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: active ? `rgba(${color},0.2)` : 'var(--surface-2)',
    border: `1px solid ${active ? `rgba(${color},0.5)` : 'var(--border)'}`,
    color: active ? `rgb(${color})` : 'var(--text-muted)',
    transition: 'all 0.15s',
  });

  const isUpwork  = form.leadSource === 'Upwork';
  const isHourly  = form.engagementType === 'Hourly';
  const autoValue = isHourly ? (form.hourlyRate ?? 0) * (form.estimatedHours ?? 0) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
          background: 'var(--surface)', borderLeft: '1px solid var(--border)',
          zIndex: 101, display: 'flex', flexDirection: 'column',
          animation: 'slideIn 0.2s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--primary)" />
              Quick Add Lead
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {added > 0 ? `✓ ${added} lead${added > 1 ? 's' : ''} added this session` : 'Fill required fields and save'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Date */}
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" value={form.date} onChange={(e) => patch('date', e.target.value)} style={fieldStyle} />
            </div>

            {/* Lead Source */}
            <div>
              <label style={labelStyle}>Lead Source *</label>
              <select value={form.leadSource} onChange={(e) => patch('leadSource', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Project Title */}
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Project Title *</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="e.g. React Dashboard for SaaS Platform"
              value={form.projectTitle}
              onChange={(e) => patch('projectTitle', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(true); }}
              style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Upwork Link */}
          {isUpwork && (
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Upwork Job Link</label>
              <input
                type="text"
                placeholder="https://upwork.com/jobs/..."
                value={form.upworkLink ?? ''}
                onChange={(e) => patch('upworkLink', e.target.value)}
                style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            {/* Profile */}
            {isUpwork && (
              <div>
                <label style={labelStyle}>Profile Used</label>
                <select value={form.profileUsedId ?? ''} onChange={(e) => patch('profileUsedId', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                  <option value="">— Select —</option>
                  {profiles.filter((p) => p.status === 'active').map((p) => (
                    <option key={p.id} value={p.id}>{p.profileName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Assigned To */}
            <div>
              <label style={labelStyle}>Assigned To *</label>
              <select
                value={form.assignedToId}
                onChange={(e) => patch('assignedToId', e.target.value)}
                style={{ ...fieldStyle, cursor: 'pointer' }}
                disabled={user.role === 'bd'}
              >
                {members.filter((m) => m.status === 'active').map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Engagement Type Toggle ───────────────────────── */}
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Engagement Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ENGAGEMENT_TYPES.map((et) => (
                <button
                  key={et}
                  type="button"
                  onClick={() => patchEngagement(et)}
                  style={toggleBtn(form.engagementType === et, et === 'Fixed' ? '15, 108, 189' : '0, 120, 212')}
                >
                  {et === 'Fixed' ? '💼 Fixed Price' : '⏱ Hourly Rate'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Hourly Fields ─────────────────────────────────── */}
          {isHourly ? (
            <div style={{ marginTop: 14, padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                ⏱ Hourly Engagement
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Hourly Rate ($/hr) *</label>
                  <input
                    type="number" min={1} step={1}
                    placeholder="e.g. 45"
                    value={form.hourlyRate ?? ''}
                    onChange={(e) => patch('hourlyRate', e.target.value === '' ? undefined : Number(e.target.value))}
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Estimated Hours *</label>
                  <input
                    type="number" min={1} step={1}
                    placeholder="e.g. 160"
                    value={form.estimatedHours ?? ''}
                    onChange={(e) => patch('estimatedHours', e.target.value === '' ? undefined : Number(e.target.value))}
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
              {/* Auto-computed total */}
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Contract Value (auto)</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                  ${autoValue?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
          ) : (
            /* ── Fixed Price Field ─────────────────────────── */
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Proposal Value (USD) *</label>
              <input
                type="number" min={0}
                value={form.proposalValue}
                onChange={(e) => patch('proposalValue', Number(e.target.value))}
                style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            {/* Connects Used */}
            <div>
              <label style={labelStyle}>Connects Used</label>
              <input
                type="number" min={0}
                value={form.connectsUsed}
                onChange={(e) => patch('connectsUsed', Number(e.target.value))}
                style={fieldStyle}
              />
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status *</label>
              <select value={form.status} onChange={(e) => patch('status', e.target.value as LeadStatus)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Bid Type */}
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Bid Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {BID_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => patch('bidType', bt)}
                  style={toggleBtn(form.bidType === bt, bt === 'Boosted' ? '216, 59, 1' : '15, 108, 189')}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Remarks</label>
            <textarea
              placeholder="Optional notes..."
              value={form.remarks ?? ''}
              onChange={(e) => patch('remarks', e.target.value)}
              rows={2}
              style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{
              flex: 1, padding: '11px', borderRadius: 4, border: '1px solid var(--primary)',
              background: 'var(--surface-2)', color: 'var(--primary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <PlusCircle size={15} />
            Save &amp; New
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              flex: 1, padding: '11px', borderRadius: 4, border: 'none',
              background: 'var(--primary)',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save & Close'}
          </button>
        </div>
      </div>
    </>
  );
}
