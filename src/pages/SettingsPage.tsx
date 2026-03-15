import { useState, useRef } from 'react';
import { Settings, User, Bell, Palette, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUpdateUser, useUploadPhoto, useDeletePhoto } from '../hooks/api/useUsers';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/api/useNotifications';
import { UserAvatar } from '../components/ui/UserAvatar';
import { useTheme } from '../hooks/useTheme';
import { themes } from '../themes/registry';
import { AvailabilityEditor } from '../components/admin/AvailabilityEditor';

type Tab = 'profile' | 'notifications' | 'appearance' | 'availability';

const NOTIFICATION_TYPES = [
  { type: 'swap_request', label: 'Swap Requests' },
  { type: 'swap_accepted', label: 'Swap Accepted' },
  { type: 'swap_approved', label: 'Swap Approved' },
  { type: 'shift_pickup', label: 'Shift Pickup' },
  { type: 'swap_cancelled', label: 'Swap Cancelled' },
];

export function SettingsPage() {
  const { user, locations } = useAuth();
  const { setTheme } = useTheme();
  const updateUser = useUpdateUser();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { data: prefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('profile');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState('');
  const [availLocId, setAvailLocId] = useState<string>('');

  if (!user) return null;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    uploadPhoto.mutate({ userId: user.id, file });
    e.target.value = '';
  }

  async function handleSaveProfile() {
    if (!user) return;
    await updateUser.mutateAsync({
      userId: user.id,
      firstName,
      lastName,
      phone: phone || undefined,
    });
  }

  function handleTogglePref(notificationType: string, channel: string, currentEnabled: boolean) {
    updatePrefs.mutate([{ notificationType, channel, enabled: !currentEnabled }]);
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'availability' as Tab, label: 'Availability', icon: Settings },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings size={20} className="text-primary" />
        <h1 className="text-xl font-display font-bold text-text">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-xl mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium transition-colors duration-fast
                       ${tab === t.id
                         ? 'bg-surface text-text shadow-sm'
                         : 'text-text-secondary hover:text-text'
                       }`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative group">
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  photoUrl={user.profilePhotoUrl}
                  size="lg"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadPhoto.isPending}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-all cursor-pointer"
                  title="Upload photo"
                >
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                  {user.profilePhotoUrl && (
                    <button
                      onClick={() => deletePhoto.mutate(user.id)}
                      disabled={deletePhoto.isPending}
                      className="text-xs text-error/70 hover:text-error flex items-center gap-0.5 transition-colors"
                    >
                      <Trash2 size={10} />
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                             focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                             focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-text-secondary block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                             placeholder:text-text-secondary/50
                             focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={updateUser.isPending}
              className="mt-3 px-4 py-2 bg-primary text-text-inverse rounded-lg text-xs font-semibold
                         hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
            >
              {updateUser.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Availability */}
      {tab === 'availability' && (
        <div className="space-y-4">
          {locations && locations.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setAvailLocId(loc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors press-effect
                             ${availLocId === loc.id
                               ? 'bg-primary text-text-inverse'
                               : 'bg-surface border border-border text-text-secondary hover:text-text'
                             }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          )}

          {availLocId ? (
            <div className="p-4 bg-surface rounded-xl border border-border">
              <AvailabilityEditor
                userId={user.id}
                locationId={availLocId}
                locationName={locations?.find((l) => l.id === availLocId)?.name ?? ''}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-text-secondary">
                {locations && locations.length > 0
                  ? 'Select a location to manage availability'
                  : 'No locations assigned to your account'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="p-4 bg-surface rounded-xl border border-border">
          <h3 className="text-sm font-semibold text-text mb-3">Notification Preferences</h3>
          <div className="space-y-3">
            {NOTIFICATION_TYPES.map(({ type, label }) => {
              const pref = prefs?.find((p) => p.notification_type === type && p.channel === 'in_app');
              const enabled = pref?.enabled ?? true;
              return (
                <div key={type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-text">{label}</span>
                  <button
                    onClick={() => handleTogglePref(type, 'in_app', enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      enabled ? 'bg-primary' : 'bg-surface-alt'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appearance */}
      {tab === 'appearance' && (
        <div className="space-y-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`w-full p-4 rounded-xl border text-left transition-colors ${
                theme.id === theme.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{theme.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{theme.description}</p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: theme.tokens.colors.primary }} />
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: theme.tokens.colors.background }} />
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: theme.tokens.colors.surface }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
