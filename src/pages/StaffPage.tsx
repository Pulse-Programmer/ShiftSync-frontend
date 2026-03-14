import { useState } from 'react';
import { Search, Users, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/api/useUsers';
import { UserDetailModal } from '../components/admin/UserDetailModal';

export function StaffPage() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const filtered = (users ?? []).filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const name = `${u.first_name} ${u.last_name}`.toLowerCase();
      return name.includes(term) || u.email.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users size={20} className="text-primary" />
        <h1 className="text-xl font-display font-bold text-text">Staff Directory</h1>
        <span className="text-xs text-text-secondary">
          {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                       placeholder:text-text-secondary/50
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {['', 'staff', 'manager', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors press-effect
                         ${roleFilter === role
                           ? 'bg-primary text-text-inverse'
                           : 'bg-surface border border-border text-text-secondary hover:text-text'
                         }`}
            >
              {role === '' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Locations</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Skills</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {u.first_name[0]}{u.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs capitalize text-text-secondary">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {u.locations?.map((loc) => (
                        <span key={loc.id} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-surface-alt rounded text-text-secondary">
                          <MapPin size={8} /> {loc.name}
                        </span>
                      ))}
                      {(!u.locations || u.locations.length === 0) && (
                        <span className="text-xs text-text-secondary/50">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {u.skills?.map((skill) => (
                        <span key={skill.id} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-surface-alt rounded text-text-secondary">
                          <Shield size={8} /> {skill.name}
                        </span>
                      ))}
                      {(!u.skills || u.skills.length === 0) && (
                        <span className="text-xs text-text-secondary/50">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.is_active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-text-secondary">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
