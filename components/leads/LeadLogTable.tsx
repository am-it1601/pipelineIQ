'use client';

import { useState, useCallback } from 'react';
import type { LeadLogEntry, BDMember, UpworkProfile, User, LeadStatus, LeadSource, BidType, EngagementType } from '@/lib/types';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import QuickAddForm from './QuickAddForm';
import { Plus, Search, Pencil, Trash2, Check, X, ExternalLink, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

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

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-35 ml-1 inline-block align-middle" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-primary ml-1 inline-block align-middle" />
    : <ChevronDown className="w-3 h-3 text-primary ml-1 inline-block align-middle" />;
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
    <Card className="animate-fade-in p-0 overflow-hidden border">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-4 border-b flex-wrap bg-card">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search projects…" 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status */}
        <Select value={filterStatus || 'all'} onValueChange={(v) => { setFilterStatus(v === 'all' || !v ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>

        {/* Source */}
        <Select value={filterSource || 'all'} onValueChange={(v) => { setFilterSource(v === 'all' || !v ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Sources</SelectItem>{LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>

        {/* Engagement Type */}
        <Select value={filterEngagement || 'all'} onValueChange={(v) => { setFilterEngagement(v === 'all' || !v ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem>{ENGAGEMENT_TYPES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>

        {/* Bid Type */}
        <Select value={filterBidType || 'all'} onValueChange={(v) => { setFilterBidType(v === 'all' || !v ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="All Bids" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Bids</SelectItem>{BID_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>

        {/* Profile */}
        <Select value={filterProfile || 'all'} onValueChange={(v) => { setFilterProfile(v === 'all' || !v ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Profiles" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Profiles</SelectItem>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.profileName}</SelectItem>)}</SelectContent>
        </Select>

        {/* Starred Only toggle */}
        <Button variant={filterHot ? "default" : "outline"} size="sm" className={`h-9 text-xs ${filterHot ? 'bg-amber-500 hover:bg-amber-600' : ''}`} onClick={() => { setFilterHot(!filterHot); resetPage(); }}>
          <Star className={`w-3.5 h-3.5 mr-1 ${filterHot ? 'fill-current' : ''}`} />
          Starred
        </Button>

        {/* BD Member (admin only) */}
        {isAdmin && (
          <Select value={filterMember || 'all'} onValueChange={(v) => { setFilterMember(v === 'all' || !v ? '' : v); resetPage(); }}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="All Members" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Members</SelectItem>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{sorted.length} entries</span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10" onClick={() => { setFilterStatus(''); setFilterSource(''); setFilterMember(''); setFilterEngagement(''); setFilterBidType(''); setFilterProfile(''); setFilterHot(false); setSearch(''); resetPage(); }}>
              ✕ Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </Button>
          )}
          <Button size="sm" onClick={() => setShowQuickAdd(true)} className="h-9 text-xs ml-1">
            <Plus className="w-4 h-4 mr-1" /> Quick Add
          </Button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {/* Sortable column headers */}
              <TableHead onClick={() => toggleSort('date')} className="cursor-pointer whitespace-nowrap h-9 px-3">Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('projectTitle')} className="cursor-pointer whitespace-nowrap h-9 px-3">Project Title <SortIcon field="projectTitle" sortField={sortField} sortDir={sortDir} /></TableHead>
              {isAdmin && <TableHead onClick={() => toggleSort('assignedToId')} className="cursor-pointer whitespace-nowrap h-9 px-3">BD Member <SortIcon field="assignedToId" sortField={sortField} sortDir={sortDir} /></TableHead>}
              <TableHead onClick={() => toggleSort('leadSource')} className="cursor-pointer whitespace-nowrap h-9 px-3">Source <SortIcon field="leadSource" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('profileUsedId')} className="cursor-pointer whitespace-nowrap h-9 px-3">Profile <SortIcon field="profileUsedId" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('engagementType')} className="cursor-pointer whitespace-nowrap h-9 px-3">Engagement <SortIcon field="engagementType" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('proposalValue')} className="cursor-pointer whitespace-nowrap h-9 px-3">Value <SortIcon field="proposalValue" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('connectsUsed')} className="cursor-pointer whitespace-nowrap h-9 px-3">Connects <SortIcon field="connectsUsed" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('bidType')} className="cursor-pointer whitespace-nowrap h-9 px-3">Bid Type <SortIcon field="bidType" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead onClick={() => toggleSort('status')} className="cursor-pointer whitespace-nowrap h-9 px-3">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></TableHead>
              <TableHead className="whitespace-nowrap h-9 px-3 text-muted-foreground font-semibold">Remarks</TableHead>
              <TableHead className="whitespace-nowrap h-9 px-3 text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((lead, i) => {
                const isEditing = editingId === lead.id;
                const canEdit   = isAdmin || lead.assignedToId === user.bdMemberId;
                const isHovered = hoverRowId === lead.id;
                return (
                  <TableRow key={lead.id}
                    onMouseEnter={() => setHoverRowId(lead.id)}
                    onMouseLeave={() => setHoverRowId(null)}
                    className={`group ${lead.isHot ? 'border-l-[3px] border-l-amber-500' : 'border-l-[3px] border-l-transparent'} ${isEditing ? 'bg-primary/5' : lead.isHot ? isHovered ? 'bg-amber-500/15' : 'bg-amber-500/10' : ''}`}
                    >
                    <TableCell className="p-2.5 text-muted-foreground whitespace-nowrap align-top">
                      {isEditing ? <EditableCell value={editDraft.date ?? lead.date} type="date" onChange={(v) => patchDraft('date', v)} /> : formatDate(lead.date)}
                    </TableCell>
                    <TableCell className="p-2.5 max-w-[220px] align-top">
                      {isEditing ? <EditableCell value={editDraft.projectTitle ?? lead.projectTitle} onChange={(v) => patchDraft('projectTitle', v)} /> : (
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <span className="truncate">{lead.projectTitle}</span>
                          {lead.upworkLink && <a href={lead.upworkLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground shrink-0 hover:text-foreground"><ExternalLink size={12} /></a>}
                        </div>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="p-2.5 whitespace-nowrap align-top">
                        {isEditing ? <EditableCell value={editDraft.assignedToId ?? lead.assignedToId} type="select" options={members.map(m => m.id)} onChange={(v) => patchDraft('assignedToId', v)} /> : getMemberName(lead.assignedToId)}
                      </TableCell>
                    )}
                    <TableCell className="p-2.5 align-top">
                      {isEditing ? <EditableCell value={editDraft.leadSource ?? lead.leadSource} type="select" options={LEAD_SOURCES} onChange={(v) => patchDraft('leadSource', v)} /> :
                        <span className="text-[10px] px-2 py-0.5 rounded border bg-muted/50 text-muted-foreground">{lead.leadSource}</span>}
                    </TableCell>
                    <TableCell className="p-2.5 text-muted-foreground whitespace-nowrap align-top">
                      {isEditing ? <EditableCell value={editDraft.profileUsedId ?? lead.profileUsedId ?? ''} type="select" options={['', ...profiles.map(p => p.id)]} onChange={(v) => patchDraft('profileUsedId', v)} /> : getProfileName(lead.profileUsedId)}
                    </TableCell>
                    <TableCell className="p-2.5 align-top">
                      {isEditing
                        ? <EditableCell value={editDraft.engagementType ?? lead.engagementType} type="select" options={ENGAGEMENT_TYPES} onChange={(v) => patchDraft('engagementType', v)} />
                        : <span className={`text-[10px] px-2 py-0.5 rounded border ${lead.engagementType === 'Hourly' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'}`}>{lead.engagementType}</span>}
                    </TableCell>
                    <TableCell className="p-2.5 text-cyan-500 font-semibold whitespace-nowrap align-top">
                      {isEditing
                        ? <EditableCell value={editDraft.proposalValue ?? lead.proposalValue} type="number" onChange={(v) => patchDraft('proposalValue', v)} />
                        : (
                          <div className="flex flex-col gap-0.5">
                            <div>{formatCurrency(lead.proposalValue)}</div>
                            {lead.engagementType === 'Hourly' && lead.hourlyRate && lead.estimatedHours && (
                              <div className="text-[9px] text-muted-foreground font-normal">${lead.hourlyRate}/hr × {lead.estimatedHours}h</div>
                            )}
                          </div>
                        )}
                    </TableCell>
                    <TableCell className="p-2.5 text-muted-foreground text-center align-top">
                      {isEditing ? <EditableCell value={editDraft.connectsUsed ?? lead.connectsUsed} type="number" onChange={(v) => patchDraft('connectsUsed', v)} /> : lead.connectsUsed}
                    </TableCell>
                    <TableCell className="p-2.5 align-top">
                      {isEditing ? <EditableCell value={editDraft.bidType ?? lead.bidType} type="select" options={BID_TYPES} onChange={(v) => patchDraft('bidType', v)} /> :
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${lead.bidType === 'Boosted' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'}`}>{lead.bidType}</span>}
                    </TableCell>
                    <TableCell className="p-2.5 align-top">
                      {isEditing ? <EditableCell value={editDraft.status ?? lead.status} type="select" options={STATUSES} onChange={(v) => patchDraft('status', v)} /> : <StatusBadge status={lead.status} size="sm" />}
                    </TableCell>
                    <TableCell className="p-2.5 text-muted-foreground max-w-[150px] align-top">
                      {isEditing ? <EditableCell value={editDraft.remarks ?? lead.remarks ?? ''} onChange={(v) => patchDraft('remarks', v)} /> :
                        <span className="truncate block opacity-80">{lead.remarks || '—'}</span>}
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap align-top">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <Button variant="default" size="sm" className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700" onClick={saveEdit} disabled={saving}>
                            <Check className="w-3 h-3 mr-1" />{saving ? '…' : 'Save'}
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={cancelEdit}>
                            <X className="w-3 h-3 mr-1" />Cancel
                          </Button>
                        </div>
                      ) : canEdit ? (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Star / Hot toggle */}
                          <Button
                            variant={lead.isHot ? "default" : "outline"} size="icon" className={`w-6 h-6 ${lead.isHot ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500/30' : 'text-muted-foreground'}`}
                            onClick={() => toggleHot(lead)} title={lead.isHot ? 'Unmark hot' : 'Mark as hot'}>
                            <Star className={`w-3 h-3 ${lead.isHot ? 'fill-current' : ''}`} />
                          </Button>
                          <Button variant="outline" size="icon" className="w-6 h-6 text-muted-foreground" onClick={() => startEdit(lead)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          {isAdmin && (
                            <Button variant="outline" size="icon" className="w-6 h-6 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => deleteLead(lead.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={isAdmin ? 13 : 12} className="p-10 text-center text-muted-foreground">No lead entries found. Click <strong>Quick Add</strong> to log your first lead.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ─────────────────────────────────── */}
        <div className="p-3 border-t flex items-center justify-between flex-wrap gap-2 bg-muted/20">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
            </span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {getPageNums().map(n => (
              <Button key={n} variant={n === safePage ? "default" : "outline"} size="icon" className="w-8 h-8 text-xs" onClick={() => setPage(n)}>{n}</Button>
            ))}
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      {showQuickAdd && (
        <QuickAddForm user={user} members={members} profiles={profiles} onAdd={handleAddLead} onClose={() => setShowQuickAdd(false)} />
      )}
    </Card>
  );
}
