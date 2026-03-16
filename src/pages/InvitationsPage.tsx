import { useState } from 'react';
import { Mail, Send, Trash2, RefreshCw, Check, Clock, Link2, CheckCheck } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAuth } from '../hooks/useAuth';
import {
  useInvitations,
  useCreateInvitation,
  useRevokeInvitation,
  useResendInvitation,
} from '../hooks/api/useInvitations';
import { useLocations } from '../hooks/api/useLocations';
import { useSkills } from '../hooks/api/useShifts';
import { Modal } from '../components/ui/Modal';

export function InvitationsPage() {
  const { user } = useAuth();
  const { data: invitations, isLoading } = useInvitations();
  const { data: locations } = useLocations();
  const { data: skills } = useSkills();
  const createInvite = useCreateInvitation();
  const revokeInvite = useRevokeInvitation();
  const resendInvite = useResendInvitation();

  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'staff' | 'manager'>('staff');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

  async function handleCreate() {
    await createInvite.mutateAsync({
      email,
      role,
      locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
      skillIds: selectedSkills.length > 0 ? selectedSkills : undefined,
    });
    setShowCreate(false);
    setEmail('');
    setRole('staff');
    setSelectedLocations([]);
    setSelectedSkills([]);
  }

  const pending = invitations?.filter((i) => !i.accepted_at) ?? [];
  const accepted = invitations?.filter((i) => i.accepted_at) ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail size={20} className="text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Invitations</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-text-inverse rounded-lg
                     text-xs font-semibold hover:bg-primary-hover transition-colors press-effect"
        >
          <Send size={12} />
          Invite
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Pending ({pending.length})
          </p>
          <div className="space-y-2 mb-6">
            {pending.map((inv) => (
              <div key={inv.id} className="p-4 bg-surface rounded-xl border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs capitalize text-text-secondary">{inv.role}</span>
                      <span className="flex items-center gap-1 text-[10px] text-warning">
                        <Clock size={10} />
                        Expires {DateTime.fromISO(inv.expires_at).toRelative()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/accept-invite?token=${inv.token}`;
                        navigator.clipboard.writeText(link);
                        setCopiedId(inv.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="p-1.5 rounded-lg border border-border text-text-secondary
                                 hover:bg-surface-hover transition-colors"
                      title="Copy invite link"
                    >
                      {copiedId === inv.id ? <CheckCheck size={12} className="text-success" /> : <Link2 size={12} />}
                    </button>
                    <button
                      onClick={() => resendInvite.mutate(inv.id)}
                      disabled={resendInvite.isPending}
                      className="p-1.5 rounded-lg border border-border text-text-secondary
                                 hover:bg-surface-hover transition-colors"
                      title="Resend"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Revoke invitation to ${inv.email}?`))
                          revokeInvite.mutate(inv.id);
                      }}
                      disabled={revokeInvite.isPending}
                      className="p-1.5 rounded-lg border border-error/20 text-error
                                 hover:bg-error/10 transition-colors"
                      title="Revoke"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Accepted */}
      {accepted.length > 0 && (
        <>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Accepted ({accepted.length})
          </p>
          <div className="space-y-2">
            {accepted.map((inv) => (
              <div key={inv.id} className="p-4 bg-surface rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{inv.email}</p>
                    <span className="text-xs capitalize text-text-secondary">{inv.role}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <Check size={12} />
                    Accepted {DateTime.fromISO(inv.accepted_at!).toRelative()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty */}
      {!isLoading && (!invitations || invitations.length === 0) && (
        <div className="text-center py-12">
          <Mail size={32} className="text-text-secondary/30 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No invitations sent yet</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Send Invitation">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                         placeholder:text-text-secondary/50
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'staff' | 'manager')}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="staff">Staff</option>
              {isAdmin && <option value="manager">Manager</option>}
            </select>
          </div>

          {locations && locations.length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Locations (optional)
              </label>
              <div className="space-y-1">
                {locations.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 text-sm text-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLocations([...selectedLocations, loc.id]);
                        } else {
                          setSelectedLocations(selectedLocations.filter((id) => id !== loc.id));
                        }
                      }}
                      className="rounded border-border"
                    />
                    {loc.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Skills (optional)
              </label>
              <div className="space-y-1">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-2 text-sm text-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills([...selectedSkills, skill.id]);
                        } else {
                          setSelectedSkills(selectedSkills.filter((id) => id !== skill.id));
                        }
                      }}
                      className="rounded border-border"
                    />
                    {skill.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 px-4 border border-border rounded-lg text-sm font-medium
                         text-text hover:bg-surface-hover transition-colors press-effect"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!email.trim() || createInvite.isPending}
              className="flex-1 py-2 px-4 bg-primary text-text-inverse rounded-lg text-sm font-semibold
                         hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
            >
              {createInvite.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
