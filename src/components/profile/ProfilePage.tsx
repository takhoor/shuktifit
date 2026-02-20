import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { toast } from '../ui/Toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { saveUserProfile } from '../../hooks/useUserProfile';
import { EQUIPMENT_OPTIONS, EXPERIENCE_LEVELS } from '../../utils/constants';
import {
  isWithingsConnected,
  startWithingsAuth,
  handleWithingsCallback,
  syncWithingsData,
  disconnectWithings,
} from '../../services/withings';

export function ProfilePage() {
  const profile = useUserProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [syncing, setSyncing] = useState(false);
  const [callbackHandled, setCallbackHandled] = useState(false);

  // Handle Withings OAuth callback params
  useEffect(() => {
    if (callbackHandled) return;
    if (!searchParams.has('withings')) return;

    setCallbackHandled(true);

    (async () => {
      const status = searchParams.get('withings');
      if (status === 'success') {
        const ok = await handleWithingsCallback(searchParams);
        if (ok) {
          toast('Withings connected successfully!', 'success');
          // Auto-sync after connecting
          setSyncing(true);
          try {
            const result = await syncWithingsData();
            if (result.synced) {
              toast(`Synced ${result.weightCount} weight + ${result.activityCount} activity records`);
            }
          } catch {
            // Sync failure is non-critical
          } finally {
            setSyncing(false);
          }
        } else {
          toast('Failed to save Withings tokens', 'error');
        }
      } else if (status === 'error') {
        const msg = searchParams.get('msg') || 'Connection failed';
        toast(`Withings error: ${msg}`, 'error');
      }

      // Clear URL params
      setSearchParams({}, { replace: true });
    })();
  }, [searchParams, callbackHandled, setSearchParams]);

  if (!profile) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">
            Complete onboarding first
          </p>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setEditData({ ...profile });
    setEditing(true);
  };

  const handleSave = async () => {
    const { id, createdAt, updatedAt, ...data } = editData as Record<string, unknown>;
    await saveUserProfile(data as Parameters<typeof saveUserProfile>[0]);
    setEditing(false);
  };

  const toggleEquipment = (eq: string) => {
    const current = (editData.equipment as string[]) || [];
    setEditData({
      ...editData,
      equipment: current.includes(eq)
        ? current.filter((e: string) => e !== eq)
        : [...current, eq],
    });
  };

  const withingsConnected = isWithingsConnected(profile);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncWithingsData();
      if (result.synced) {
        toast(`Synced ${result.weightCount} weight + ${result.activityCount} activity records`, 'success');
      } else {
        toast('No Withings connection found', 'error');
      }
    } catch {
      toast('Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWithings();
    toast('Withings disconnected');
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Profile"
        right={
          editing ? (
            <button
              onClick={handleSave}
              className="text-sm font-semibold text-accent"
            >
              Save
            </button>
          ) : (
            <button
              onClick={startEdit}
              className="text-sm text-text-secondary"
            >
              Edit
            </button>
          )
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4">
        {/* User Info */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xl font-bold text-accent">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-text-primary">{profile.name}</h2>
              <p className="text-xs text-text-secondary capitalize">
                {profile.experienceLevel} · {profile.trainingFrequency} days/week
              </p>
            </div>
          </div>
          {editing ? (
            <div className="space-y-3">
              <Input
                label="Name"
                value={editData.name as string}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <div>
                <label className="text-sm text-text-secondary mb-1 block">
                  Experience
                </label>
                <div className="flex gap-2">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() =>
                        setEditData({ ...editData, experienceLevel: l })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize ${
                        editData.experienceLevel === l
                          ? 'bg-accent text-white'
                          : 'bg-bg-elevated text-text-secondary'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm text-text-secondary">
              <p>Goals: {profile.goals.join(', ') || 'None'}</p>
              {profile.injuries && <p>Injuries: {profile.injuries}</p>}
            </div>
          )}
        </Card>

        {/* Equipment */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Equipment
          </h3>
          {editing ? (
            <div className="space-y-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-medium capitalize ${
                    (editData.equipment as string[])?.includes(eq)
                      ? 'bg-accent/20 text-accent border border-accent'
                      : 'bg-bg-elevated text-text-secondary border border-border'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.equipment.map((eq) => (
                <span
                  key={eq}
                  className="px-2.5 py-1 rounded-full text-xs bg-bg-elevated text-text-secondary capitalize"
                >
                  {eq}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Withings Integration */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Withings
          </h3>
          {withingsConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-text-primary">Connected</span>
                {profile.withingsUserId && (
                  <span className="text-xs text-text-muted ml-auto">
                    ID: {profile.withingsUserId}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-accent text-white disabled:opacity-50"
                >
                  {syncing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size={14} /> Syncing...
                    </span>
                  ) : (
                    'Sync Now'
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-2.5 px-4 rounded-lg text-xs font-medium bg-bg-elevated text-red-400 border border-red-400/30"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Connect your Withings account to auto-sync weight, steps, heart rate, and sleep data.
              </p>
              <button
                onClick={startWithingsAuth}
                className="w-full py-2.5 rounded-lg text-xs font-medium bg-accent text-white"
              >
                Connect Withings
              </button>
            </div>
          )}
        </Card>

        {/* Links */}
        <Card padding={false}>
          <Link
            to="/calendar"
            className="flex items-center justify-between px-4 py-3 active:bg-bg-elevated"
          >
            <span className="text-sm text-text-primary">PPL Calendar</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </Card>

        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-text-muted">
            ShuktiFit v0.6.0 · Phase 6
          </p>
        </div>
      </div>
    </div>
  );
}
