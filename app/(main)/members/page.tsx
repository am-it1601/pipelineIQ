'use client';

import { useEffect, useState } from 'react';
import type { BDMember } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import SectionHeader from '@/components/ui/SectionHeader';
import { Plus, Pencil, Check, X, Power } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const empty = (): Omit<BDMember, 'id'> => ({
  name: '',
  status: 'active',
  monthlyTarget: 50,
  incentiveEligible: true,
  joinDate: new Date().toISOString().split('T')[0],
});

export default function MembersPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();
  const [members, setMembers] = useState<BDMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<BDMember>>({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState(empty());

  useEffect(() => {
    if (user?.role !== 'admin') { router.replace('/dashboard'); return; }
    fetch('/api/members').then((r) => r.json()).then((d) => { setMembers(d); setLoading(false); });
  }, []);

  const startEdit = (m: BDMember) => { setEditingId(m.id); setDraft({ ...m }); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };

  const saveEdit = async () => {
    const res = await fetch(`/api/members/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    if (res.ok) { const updated = await res.json(); setMembers((p) => p.map((m) => m.id === editingId ? updated : m)); }
    setEditingId(null); setDraft({});
  };

  const toggleStatus = async (member: BDMember) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const res = await fetch(`/api/members/${member.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { const updated = await res.json(); setMembers((p) => p.map((m) => m.id === member.id ? updated : m)); }
  };

  const saveNew = async () => {
    if (!newForm.name.trim()) return;
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
    if (res.ok) { const created = await res.json(); setMembers((p) => [...p, created]); setAdding(false); setNewForm(empty()); }
  };

  const inputStyle: React.CSSProperties = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--text)', outline: 'none', width: '100%' };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="BD Members"
        subtitle={`${members.filter(m => m.status === 'active').length} active members`}
        action={
          <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} />Add Member
          </button>
        }
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Name', 'Status', 'Monthly Target', 'Incentive Eligible', 'Join Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* New member row */}
            {adding && (
              <tr style={{ background: 'rgba(99,102,241,0.07)' }}>
                <td style={{ padding: '8px 14px' }}><input autoFocus placeholder="Full Name" value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} onKeyDown={(e) => { if (e.key === 'Enter') saveNew(); }} /></td>
                <td style={{ padding: '8px 14px' }}><select value={newForm.status} onChange={(e) => setNewForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} style={inputStyle}><option>active</option><option>inactive</option></select></td>
                <td style={{ padding: '8px 14px' }}><input type="number" value={newForm.monthlyTarget} onChange={(e) => setNewForm((f) => ({ ...f, monthlyTarget: Number(e.target.value) }))} style={inputStyle} /></td>
                <td style={{ padding: '8px 14px' }}><select value={newForm.incentiveEligible ? 'yes' : 'no'} onChange={(e) => setNewForm((f) => ({ ...f, incentiveEligible: e.target.value === 'yes' }))} style={inputStyle}><option value="yes">Yes</option><option value="no">No</option></select></td>
                <td style={{ padding: '8px 14px' }}><input type="date" value={newForm.joinDate} onChange={(e) => setNewForm((f) => ({ ...f, joinDate: e.target.value }))} style={inputStyle} /></td>
                <td style={{ padding: '8px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={saveNew} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Save</button>
                    <button onClick={() => setAdding(false)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Cancel</button>
                  </div>
                </td>
              </tr>
            )}

            {members.map((m, i) => {
              const isEditing = editingId === m.id;
              return (
                <tr key={m.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>
                    {isEditing ? <input value={draft.name ?? m.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} style={inputStyle} autoFocus /> : m.name}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: m.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: m.status === 'active' ? '#10b981' : '#ef4444', border: `1px solid ${m.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text)' }}>
                    {isEditing ? <input type="number" value={draft.monthlyTarget ?? m.monthlyTarget} onChange={(e) => setDraft((d) => ({ ...d, monthlyTarget: Number(e.target.value) }))} style={{ ...inputStyle, width: 70 }} /> : m.monthlyTarget}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: m.incentiveEligible ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)', color: m.incentiveEligible ? '#818cf8' : 'var(--text-muted)' }}>
                      {m.incentiveEligible ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(m.joinDate)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={saveEdit} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Save</button>
                        <button onClick={cancelEdit} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(m)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></button>
                        <button onClick={() => toggleStatus(m)} title={m.status === 'active' ? 'Deactivate' : 'Activate'} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${m.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, background: 'transparent', color: m.status === 'active' ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Power size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
