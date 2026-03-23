'use client';

import { useState, useRef, useEffect } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile, User, LeadStatus, LeadSource, BidType, EngagementType } from '@/lib/types';
import { format } from 'date-fns';
import { X, Save, PlusCircle, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <Sheet open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="sm:max-w-[500px] w-[500px] overflow-hidden p-0 flex flex-col" style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>
        <SheetHeader className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between pointer-events-none">
            <div className="text-left">
              <SheetTitle className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--text)' }}>
                <Zap size={18} color="var(--primary)" />
                Quick Add Lead
              </SheetTitle>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {added > 0 ? `✓ ${added} lead${added > 1 ? 's' : ''} added this session` : 'Fill required fields and save'}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => patch('date', e.target.value)} />
            </div>

            {/* Lead Source */}
            <div className="space-y-1.5">
              <Label>Lead Source *</Label>
              <Select value={form.leadSource} onValueChange={(v) => patch('leadSource', v as LeadSource)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-1.5">
            <Label>Project Title *</Label>
            <Input
              ref={titleRef}
              type="text"
              placeholder="e.g. React Dashboard for SaaS Platform"
              value={form.projectTitle}
              onChange={(e) => patch('projectTitle', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(true); }}
            />
          </div>

          {/* Upwork Link */}
          {isUpwork && (
            <div className="space-y-1.5">
              <Label>Upwork Job Link</Label>
              <Input
                type="text"
                placeholder="https://upwork.com/jobs/..."
                value={form.upworkLink ?? ''}
                onChange={(e) => patch('upworkLink', e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Profile */}
            {isUpwork && (
              <div className="space-y-1.5">
                <Label>Profile Used</Label>
                <Select value={form.profileUsedId ?? ''} onValueChange={(v) => patch('profileUsedId', v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="— Select —" /></SelectTrigger>
                  <SelectContent>
                    {profiles.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.profileName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Assigned To */}
            <div className="space-y-1.5">
              <Label>Assigned To *</Label>
              <Select
                value={form.assignedToId}
                onValueChange={(v) => patch('assignedToId', v ?? '')}
                disabled={user.role === 'bd'}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {members.filter((m) => m.status === 'active').map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Engagement Type Toggle */}
          <div className="space-y-1.5">
            <Label>Engagement Type *</Label>
             <div className="flex gap-2">
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

          {/* Hourly Fields */}
          {isHourly ? (
            <div className="p-3.5 rounded-md border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
                ⏱ Hourly Engagement
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Hourly Rate ($/hr) *</Label>
                  <Input
                    type="number" min={1} step={1}
                    placeholder="e.g. 45"
                    value={form.hourlyRate ?? ''}
                    onChange={(e) => patch('hourlyRate', e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Hours *</Label>
                  <Input
                    type="number" min={1} step={1}
                    placeholder="e.g. 160"
                    value={form.estimatedHours ?? ''}
                    onChange={(e) => patch('estimatedHours', e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </div>
              </div>
              {/* Auto-computed total */}
              <div className="mt-2.5 p-2 rounded flex items-center justify-between border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Contract Value (auto)</span>
                <span className="text-base font-bold" style={{ color: 'var(--accent)' }}>
                  ${autoValue?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Proposal Value (USD) *</Label>
              <Input
                type="number" min={0}
                value={form.proposalValue}
                onChange={(e) => patch('proposalValue', Number(e.target.value))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Connects Used</Label>
              <Input
                type="number" min={0}
                value={form.connectsUsed}
                onChange={(e) => patch('connectsUsed', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => patch('status', v as LeadStatus)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bid Type */}
          <div className="space-y-1.5">
            <Label>Bid Type *</Label>
            <div className="flex gap-2">
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

          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Optional notes..."
              value={form.remarks ?? ''}
              onChange={(e) => patch('remarks', e.target.value)}
              rows={2}
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="absolute flex gap-2.5 p-4 border-t bottom-0 w-full" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <PlusCircle size={15} className="mr-1.5" />
            Save &amp; New
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save size={15} className="mr-1.5" />
            {saving ? 'Saving…' : 'Save & Close'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
