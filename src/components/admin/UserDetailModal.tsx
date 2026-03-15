import { useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  useUser,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
  useAssignSkill,
  useRemoveSkill,
  useCertifyLocation,
  useDecertifyLocation,
} from '../../hooks/api/useUsers';
import { useSkills } from '../../hooks/api/useShifts';
import { useLocations } from '../../hooks/api/useLocations';
import {
  Save,
  X,
  MapPin,
  Shield,
  UserX,
  UserCheck,
} from 'lucide-react';

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  isAdmin: boolean;
}

export function UserDetailModal({ open, onClose, userId, isAdmin }: UserDetailModalProps) {
  const { data: user, isLoading } = useUser(open ? userId : null);
  const { data: allSkills } = useSkills();
  const { data: allLocations } = useLocations();
  const updateUser = useUpdateUser();
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const assignSkill = useAssignSkill();
  const removeSkill = useRemoveSkill();
  const certifyLoc = useCertifyLocation();
  const decertifyLoc = useDecertifyLocation();

  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    desiredWeeklyHours: string;
  } | null>(null);

  // Initialize form when user loads
  if (user && !editForm) {
    setEditForm({
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone ?? '',
      desiredWeeklyHours: user.desired_weekly_hours?.toString() ?? '',
    });
  }

  const userSkillIds = new Set(user?.skills?.map((s) => s.id) ?? []);
  const userLocationIds = new Set(user?.locations?.map((l) => l.id) ?? []);
  const availableSkills = allSkills?.filter((s) => !userSkillIds.has(s.id)) ?? [];
  const availableLocations = allLocations?.filter((l) => !userLocationIds.has(l.id)) ?? [];

  async function handleSave() {
    if (!editForm || !user) return;
    await updateUser.mutateAsync({
      userId: user.id,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone || undefined,
      desiredWeeklyHours: editForm.desiredWeeklyHours
        ? parseFloat(editForm.desiredWeeklyHours)
        : undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Staff Details" wide>
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {user && editForm && (
        <div className="space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user.is_active
                ? 'bg-success/15 text-success'
                : 'bg-error/15 text-error'
            }`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-text-secondary capitalize">{user.role}</span>
            <span className="text-xs text-text-secondary">{user.email}</span>
          </div>

          {/* Edit form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">First Name</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Last Name</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                           placeholder:text-text-secondary/50
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Desired Weekly Hours</label>
              <input
                type="number"
                value={editForm.desiredWeeklyHours}
                onChange={(e) => setEditForm({ ...editForm, desiredWeeklyHours: e.target.value })}
                placeholder="e.g. 30"
                min="0"
                max="80"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                           placeholder:text-text-secondary/50
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-text-inverse rounded-lg
                       text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
          >
            <Save size={12} />
            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Skills */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text mb-2 flex items-center gap-1.5">
              <Shield size={14} /> Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {user.skills?.map((skill) => (
                <span key={skill.id} className="flex items-center gap-1 px-2 py-1 bg-surface-alt rounded-lg text-xs text-text">
                  {skill.name}
                  <button
                    onClick={() => removeSkill.mutate({ userId: user.id, skillId: skill.id })}
                    className="text-text-secondary hover:text-error transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {(!user.skills || user.skills.length === 0) && (
                <span className="text-xs text-text-secondary">No skills assigned</span>
              )}
            </div>
            {availableSkills.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  id="add-skill"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      assignSkill.mutate({ userId: user.id, skillId: e.target.value });
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 bg-surface border border-border rounded-lg text-xs text-text
                             focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Add skill...</option>
                  {availableSkills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text mb-2 flex items-center gap-1.5">
              <MapPin size={14} /> Location Certifications
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {user.locations?.map((loc) => (
                <span key={loc.id} className="flex items-center gap-1 px-2 py-1 bg-surface-alt rounded-lg text-xs text-text">
                  {loc.name}
                  <button
                    onClick={() => decertifyLoc.mutate({ userId: user.id, locationId: loc.id })}
                    className="text-text-secondary hover:text-error transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {(!user.locations || user.locations.length === 0) && (
                <span className="text-xs text-text-secondary">No locations certified</span>
              )}
            </div>
            {availableLocations.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      certifyLoc.mutate({ userId: user.id, locationId: e.target.value });
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 bg-surface border border-border rounded-lg text-xs text-text
                             focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Add location...</option>
                  {availableLocations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Deactivate/Reactivate */}
          {isAdmin && (
            <div className="border-t border-border pt-4">
              {user.is_active ? (
                <button
                  onClick={() => { if (confirm(`Deactivate ${user.first_name} ${user.last_name}?`)) deactivate.mutate(user.id); }}
                  disabled={deactivate.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-error/30 text-error rounded-lg
                             text-xs font-semibold hover:bg-error/10 transition-colors press-effect"
                >
                  <UserX size={12} />
                  {deactivate.isPending ? 'Deactivating...' : 'Deactivate User'}
                </button>
              ) : (
                <button
                  onClick={() => reactivate.mutate(user.id)}
                  disabled={reactivate.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-white rounded-lg
                             text-xs font-semibold hover:bg-success/90 transition-colors press-effect"
                >
                  <UserCheck size={12} />
                  {reactivate.isPending ? 'Reactivating...' : 'Reactivate User'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
