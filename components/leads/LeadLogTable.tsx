'use client';

import { useState, useCallback } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile, User, LeadStatus, LeadSource, BidType, EngagementType } from '@/lib/types';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import QuickAddForm from './QuickAddForm';
import { Plus, Search, Pencil, Trash2, Check, X, ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Star } from 'lucide-react';

const LEAD_SOURCES: LeadSource[]   = ['Upwork', 'Referral', 'LinkedIn', 'Direct'];
const BID_TYPES: BidType[]         = ['Normal', 'Boosted'];
const ENGAGEMENT_TYPES: EngagementType[] = ['Fixed', 'Hourly'];
const STATUSES: LeadStatus[]       = ['Submitted', 'Viewed', 'Discussion', 'Follow Up', 'Waiting Client', 'Won', 'Lost'];
const PAGE_SIZES = [20, 50, 100];

type SortField =
  | 'date' | 'projectTitle' | 'assignedToId'
  | 'leadSource' | 'profileUsedId' | 'engagementType'
  | 'proposalValue' | 'connectsUsed' | 'bidType' | 'status';
type SortDir = 'asc' | 'desc';

interface Props {
  initialLeads: LeadLogEntry[];
  members: BDMember[];
  profiles: UpworkProfile[];
  user: User;
}

function EditableCell({ value, type = 'text', options, onChange }: {
  value: string | number;
  type?: 'text' | 'number' | 'date' | 'select' | 'url';
  options?: string[];
  onChange: (v: string) => void;
}) {
  const style: React.CSSProperties = {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: 4, padding: '3px 6px',
    fontSize: 12, color: 'var(--text)', width: '100%', outline: 'none',
  };
  if (type === 'select' && options) {
    return <select value={value} onChange={(e) => onChange(e.target.value)} style={style} autoFocus>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>;
  }
  return <input type={type === 'url' ? 'text' : type} value={value} onChange={(e) => onChange(e.target.value)} style={style} autoFocus />;
}

/** Sort icon with three states: neutral, asc, desc */
function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown size={11} style={{ opacity: 0.35, marginLeft: 3, verticalAlign: 'middle' }} />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} style={{ color: 'var(--primary)', marginLeft: 3, verticalAlign: 'middle' }} />
    : <ChevronDown size={11} style={{ color: 'var(--primary)', marginLeft: 3, verticalAlign: 'middle' }} />;
}

export default function LeadLogTable({ initialLeads, members, profiles, user }: Props) {
  const [leads, setLeads] = useState<LeadLogEntry[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterEngagement, setFilterEngagement] = useState('');
  const [filterBidType, setFilterBidType] = useState('');
  const [filterProfile, setFilterProfile] = useState('');
  const [filterHot, setFilterHot] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<LeadLogEntry>>({});
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);
  // Sort state
  const [sortField, setSortField]   = useState<SortField>('date');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  // Pagination
  const [page, setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const isAdmin = user.role === 'admin';
  const scopedLeads = isAdmin ? leads : leads.filter((l) => l.assignedToId === user.bdMemberId);

  const filtered = scopedLeads.filter((l) => {
    if (search && !l.projectTitle.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    if (filterSource && l.leadSource !== filterSource) return false;
    if (filterMember && l.assignedToId !== filterMember) return false;
    if (filterEngagement && l.engagementType !== filterEngagement) return false;
    if (filterBidType && l.bidType !== filterBidType) return false;
    if (filterProfile && l.profileUsedId !== filterProfile) return false;
    if (filterHot && !l.isHot) return false;
    return true;
  });

  // Sort — hot leads always float to top, then apply column sort within each group
  const sorted = [...filtered].sort((a, b) => {
    // Hot-first: starred leads always come first
    if (a.isHot && !b.isHot) return -1;
    if (!a.isHot && b.isHot) return 1;
    // Within group: apply column sort
    let cmp = 0;
    if (sortField === 'proposalValue') {
      cmp = a.proposalValue - b.proposalValue;
    } else if (sortField === 'connectsUsed') {
      cmp = a.connectsUsed - b.connectsUsed;
    } else {
      const av = String(((a as unknown) as Record<string, unknown>)[sortField] ?? '');
      const bv = String(((b as unknown) as Record<string, unknown>)[sortField] ?? '');
      cmp = av.localeCompare(bv);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage = () => setPage(1);

  const startEdit  = (lead: LeadLogEntry) => { setEditingId(lead.id); setEditDraft({ ...lead }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${editingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editDraft),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads((prev) => prev.map((l) => l.id === editingId ? updated : l));
      }
    } finally { setSaving(false); setEditingId(null); setEditDraft({}); }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead entry?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleHot = async (lead: LeadLogEntry) => {
    const newVal = !lead.isHot;
    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, isHot: newVal } : l));
    await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isHot: newVal }),
    });
  };

  const handleAddLead = async (data: Omit<LeadLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (res.ok) { const newLead = await res.json(); setLeads((prev) => [newLead, ...prev]); }
  };

  const patchDraft = (field: keyof LeadLogEntry, val: string) => {
    setEditDraft((d) => {
      const next = { ...d, [field]: ['proposalValue','connectsUsed','hourlyRate','estimatedHours'].includes(field) ? Number(val) : val } as Partial<LeadLogEntry>;
      if (field === 'hourlyRate' || field === 'estimatedHours') {
        const rate = field === 'hourlyRate' ? Number(val) : (next.hourlyRate ?? 0);
        const hrs  = field === 'estimatedHours' ? Number(val) : (next.estimatedHours ?? 0);
        if ((next.engagementType ?? d.engagementType) === 'Hourly') next.proposalValue = rate * hrs;
      }
      return next;
    });
  };

  const getMemberName  = (id: string)  => members.find((m) => m.id === id)?.name ?? id;
  const getProfileName = (id?: string) => profiles.find((p) => p.id === id)?.profileName ?? '—';

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4,
    padding: '8px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const paginationBtnStyle = (active?: boolean): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: 4, border: '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'var(--surface-2)',
    color: active ? '#fff' : 'var(--text-muted)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.1s',
  });

  const thStyle = (field: SortField): React.CSSProperties => ({
    padding: '10px 12px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600,
    color: sortField === field ? 'var(--primary)' : 'var(--text-muted)',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' as const,
    cursor: 'pointer', userSelect: 'none' as const,
    background: sortField === field ? 'rgba(15, 108, 189, 0.05)' : undefined,
    transition: 'color 0.1s',
  });

  const getPageNums = () => {
    const nums: number[] = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  const activeFilterCount = [filterStatus, filterSource, filterMember, filterEngagement, filterBidType, filterProfile, filterHot ? 'hot' : ''].filter(Boolean).length;

  return (
    <div className="animate-fade-in">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search projects…" value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            style={{ ...inputStyle, paddingLeft: 32, width: '100%', boxSizing: 'border-box' }} />
        </div>

        {/* Status */}
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} style={selectStyle}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Source */}
        <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value); resetPage(); }} style={selectStyle}>
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Engagement Type */}
        <select value={filterEngagement} onChange={(e) => { setFilterEngagement(e.target.value); resetPage(); }} style={selectStyle}>
          <option value="">All Types</option>
          {ENGAGEMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
        </select>

        {/* Bid Type */}
        <select value={filterBidType} onChange={(e) => { setFilterBidType(e.target.value); resetPage(); }} style={selectStyle}>
          <option value="">All Bids</option>
          {BID_TYPES.map((b) => <option key={b}>{b}</option>)}
        </select>

        {/* Profile */}
        <select value={filterProfile} onChange={(e) => { setFilterProfile(e.target.value); resetPage(); }} style={selectStyle}>
          <option value="">All Profiles</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.profileName}</option>)}
        </select>

        {/* Starred Only toggle */}
        <button
          onClick={() => { setFilterHot(h => !h); resetPage(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: filterHot ? '1px solid rgba(245,158,11,0.5)' : '1px solid var(--border)',
            background: filterHot ? 'rgba(245,158,11,0.12)' : 'var(--surface-2)',
            color: filterHot ? '#f59e0b' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <Star size={13} fill={filterHot ? '#f59e0b' : 'none'} />
          Starred
        </button>

        {/* BD Member (admin only) */}
        {isAdmin && (
          <select value={filterMember} onChange={(e) => { setFilterMember(e.target.value); resetPage(); }} style={selectStyle}>
            <option value="">All Members</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{sorted.length} entries</span>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterStatus(''); setFilterSource(''); setFilterMember(''); setFilterEngagement(''); setFilterBidType(''); setFilterProfile(''); setFilterHot(false); setSearch(''); resetPage(); }}
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
            >
              ✕ Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        <button onClick={() => setShowQuickAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 4, background: 'var(--primary)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}>
          <Plus size={15} />Quick Add
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {/* Sortable column headers */}
                <th onClick={() => toggleSort('date')} style={thStyle('date')}>Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('projectTitle')} style={thStyle('projectTitle')}>Project Title <SortIcon field="projectTitle" sortField={sortField} sortDir={sortDir} /></th>
                {isAdmin && <th onClick={() => toggleSort('assignedToId')} style={thStyle('assignedToId')}>BD Member <SortIcon field="assignedToId" sortField={sortField} sortDir={sortDir} /></th>}
                <th onClick={() => toggleSort('leadSource')} style={thStyle('leadSource')}>Source <SortIcon field="leadSource" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('profileUsedId')} style={thStyle('profileUsedId')}>Profile <SortIcon field="profileUsedId" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('engagementType')} style={thStyle('engagementType')}>Engagement <SortIcon field="engagementType" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('proposalValue')} style={thStyle('proposalValue')}>Value <SortIcon field="proposalValue" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('connectsUsed')} style={thStyle('connectsUsed')}>Connects <SortIcon field="connectsUsed" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('bidType')} style={thStyle('bidType')}>Bid Type <SortIcon field="bidType" sortField={sortField} sortDir={sortDir} /></th>
                <th onClick={() => toggleSort('status')} style={thStyle('status')}>Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Remarks</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((lead, i) => {
                const isEditing = editingId === lead.id;
                const canEdit   = isAdmin || lead.assignedToId === user.bdMemberId;
                const isHovered = hoverRowId === lead.id;
                return (
                  <tr key={lead.id}
                    onMouseEnter={() => setHoverRowId(lead.id)}
                    onMouseLeave={() => setHoverRowId(null)}
                    style={{
                      background: isEditing
                        ? 'rgba(15, 108, 189, 0.05)'
                        : lead.isHot
                          ? isHovered ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.09)'
                          : isHovered ? 'rgba(15, 108, 189, 0.05)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      transition: 'background 0.1s',
                      borderLeft: lead.isHot ? '3px solid #f59e0b' : '3px solid transparent',
                    }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {isEditing ? <EditableCell value={editDraft.date ?? lead.date} type="date" onChange={(v) => patchDraft('date', v)} /> : formatDate(lead.date)}
                    </td>
                    <td style={{ padding: '9px 12px', maxWidth: 220 }}>
                      {isEditing ? <EditableCell value={editDraft.projectTitle ?? lead.projectTitle} onChange={(v) => patchDraft('projectTitle', v)} /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text)' }}>{lead.projectTitle}</span>
                          {lead.upworkLink && <a href={lead.upworkLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', flexShrink: 0 }}><ExternalLink size={12} /></a>}
                        </div>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '9px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {isEditing ? <EditableCell value={editDraft.assignedToId ?? lead.assignedToId} type="select" options={members.map(m => m.id)} onChange={(v) => patchDraft('assignedToId', v)} /> : getMemberName(lead.assignedToId)}
                      </td>
                    )}
                    <td style={{ padding: '9px 12px' }}>
                      {isEditing ? <EditableCell value={editDraft.leadSource ?? lead.leadSource} type="select" options={LEAD_SOURCES} onChange={(v) => patchDraft('leadSource', v)} /> :
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{lead.leadSource}</span>}
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {isEditing ? <EditableCell value={editDraft.profileUsedId ?? lead.profileUsedId ?? ''} type="select" options={['', ...profiles.map(p => p.id)]} onChange={(v) => patchDraft('profileUsedId', v)} /> : getProfileName(lead.profileUsedId)}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      {isEditing
                        ? <EditableCell value={editDraft.engagementType ?? lead.engagementType} type="select" options={ENGAGEMENT_TYPES} onChange={(v) => patchDraft('engagementType', v)} />
                        : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.engagementType === 'Hourly' ? 'rgba(34,211,238,0.12)' : 'rgba(99,102,241,0.12)', color: lead.engagementType === 'Hourly' ? '#22d3ee' : '#818cf8', border: `1px solid ${lead.engagementType === 'Hourly' ? 'rgba(34,211,238,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.engagementType}</span>}
                    </td>
                    <td style={{ padding: '9px 12px', color: '#22d3ee', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {isEditing
                        ? <EditableCell value={editDraft.proposalValue ?? lead.proposalValue} type="number" onChange={(v) => patchDraft('proposalValue', v)} />
                        : (
                          <div>
                            <div>{formatCurrency(lead.proposalValue)}</div>
                            {lead.engagementType === 'Hourly' && lead.hourlyRate && lead.estimatedHours && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>${lead.hourlyRate}/hr × {lead.estimatedHours}h</div>
                            )}
                          </div>
                        )}
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      {isEditing ? <EditableCell value={editDraft.connectsUsed ?? lead.connectsUsed} type="number" onChange={(v) => patchDraft('connectsUsed', v)} /> : lead.connectsUsed}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      {isEditing ? <EditableCell value={editDraft.bidType ?? lead.bidType} type="select" options={BID_TYPES} onChange={(v) => patchDraft('bidType', v)} /> :
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: lead.bidType === 'Boosted' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: lead.bidType === 'Boosted' ? '#f59e0b' : '#818cf8', border: `1px solid ${lead.bidType === 'Boosted' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{lead.bidType}</span>}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      {isEditing ? <EditableCell value={editDraft.status ?? lead.status} type="select" options={STATUSES} onChange={(v) => patchDraft('status', v)} /> : <StatusBadge status={lead.status} size="sm" />}
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 150 }}>
                      {isEditing ? <EditableCell value={editDraft.remarks ?? lead.remarks ?? ''} onChange={(v) => patchDraft('remarks', v)} /> :
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{lead.remarks || '—'}</span>}
                    </td>
                    <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={saveEdit} disabled={saving} style={{ padding: '5px 10px', borderRadius: 4, border: 'none', background: '#107C41', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><Check size={12} />{saving ? '…' : 'Save'}</button>
                          <button onClick={cancelEdit} style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><X size={12} />Cancel</button>
                        </div>
                      ) : canEdit ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {/* Star / Hot toggle */}
                          <button
                            onClick={() => toggleHot(lead)}
                            title={lead.isHot ? 'Unmark hot' : 'Mark as hot'}
                            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${lead.isHot ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`, background: lead.isHot ? 'rgba(245,158,11,0.12)' : 'transparent', color: lead.isHot ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                            <Star size={13} fill={lead.isHot ? '#f59e0b' : 'none'} />
                          </button>
                          <button onClick={() => startEdit(lead)} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></button>
                          {isAdmin && <button onClick={() => deleteLead(lead.id)} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={isAdmin ? 13 : 12} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No lead entries found. Click <strong>Quick Add</strong> to log your first lead.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Bar ─────────────────────────────────── */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text)', cursor: 'pointer', outline: 'none' }}
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ ...paginationBtnStyle(), opacity: safePage === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            {getPageNums().map(n => (
              <button key={n} onClick={() => setPage(n)} style={paginationBtnStyle(n === safePage)}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ ...paginationBtnStyle(), opacity: safePage === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showQuickAdd && (
        <QuickAddForm user={user} members={members} profiles={profiles} onAdd={handleAddLead} onClose={() => setShowQuickAdd(false)} />
      )}
    </div>
  );
}
