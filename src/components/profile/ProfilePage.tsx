import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { useUserProfile } from '../../hooks/useUserProfile';
import { saveUserProfile } from '../../hooks/useUserProfile';
import { EQUIPMENT_OPTIONS, EXPERIENCE_LEVELS } from '../../utils/constants';

export function ProfilePage() {
  const profile = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});

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
            ShuktiFit v0.1.0 · Phase 3
          </p>
        </div>
      </div>
    </div>
  );
}
