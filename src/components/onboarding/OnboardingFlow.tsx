import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { toast } from '../ui/Toast';
import { saveUserProfile } from '../../hooks/useUserProfile';
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
} from '../../utils/constants';
import { today } from '../../utils/dateUtils';
import { DayPicker } from '../ui/DayPicker';
import { importData } from '../../services/dataPortability';

interface OnboardingData {
  name: string;
  age: string;
  heightFeet: string;
  heightInches: string;
  gender: 'male' | 'female' | 'other';
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  trainingFrequency: string;
  workoutDays: number[];
  injuries: string;
}

const STEPS = ['Welcome', 'Basics', 'Goals', 'Schedule', 'Equipment', 'Ready'] as const;

/** Pre-select workout days based on training frequency */
function defaultDaysForFrequency(freq: number): number[] {
  switch (freq) {
    case 3: return [0, 2, 4]; // Mon, Wed, Fri
    case 4: return [0, 1, 3, 4]; // Mon, Tue, Thu, Fri
    case 5: return [0, 1, 2, 3, 4]; // Mon-Fri
    case 6: return [0, 1, 2, 3, 4, 5]; // Mon-Sat
    default: return [0, 1, 2, 3, 4]; // Mon-Fri
  }
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    age: '',
    heightFeet: '5',
    heightInches: '10',
    gender: 'male',
    goals: [],
    experienceLevel: 'intermediate',
    equipment: ['body only', 'dumbbell'],
    trainingFrequency: '5',
    workoutDays: [0, 1, 2, 3, 4],
    injuries: '',
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleComplete = async () => {
    const totalInches = parseInt(data.heightFeet) * 12 + parseInt(data.heightInches);
    await saveUserProfile({
      name: data.name,
      age: parseInt(data.age) || 25,
      heightInches: totalInches,
      gender: data.gender,
      goals: data.goals,
      experienceLevel: data.experienceLevel,
      trainingSplit: 'ppl',
      equipment: data.equipment,
      trainingFrequency: parseInt(data.trainingFrequency) || 5,
      injuries: data.injuries,
      pplStartDate: today(),
      workoutDays: data.workoutDays.length > 0 && data.workoutDays.length < 7
        ? data.workoutDays
        : undefined,
    });
    navigate('/');
  };

  const toggleGoal = (goal: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(goal)
        ? d.goals.filter((g) => g !== goal)
        : [...d.goals, goal],
    }));
  };

  const toggleEquipment = (eq: string) => {
    setData((d) => ({
      ...d,
      equipment: d.equipment.includes(eq)
        ? d.equipment.filter((e) => e !== eq)
        : [...d.equipment, eq],
    }));
  };

  return (
    <div className="flex flex-col h-full safe-top">
      {/* Progress bar */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? 'bg-accent' : 'bg-bg-elevated'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {step === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-6">💪</span>
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              ShuktiFit
            </h1>
            <p className="text-text-secondary max-w-xs mb-6">
              Your AI-powered personal trainer. Let's set up your profile to get
              personalized workouts.
            </p>
            <button
              onClick={() => restoreInputRef.current?.click()}
              disabled={restoring}
              className="text-sm text-accent font-medium active:opacity-70"
            >
              {restoring ? 'Restoring...' : 'Restore from Backup'}
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setRestoring(true);
                try {
                  const text = await file.text();
                  const result = await importData(text);
                  toast(`Restored ${result.recordsImported} records`, 'success');
                  window.location.reload();
                } catch (err) {
                  toast(err instanceof Error ? err.message : 'Restore failed', 'error');
                } finally {
                  setRestoring(false);
                  e.target.value = '';
                }
              }}
            />
          </div>
        )}

        {step === 1 && (
          <div className="py-6 space-y-5">
            <h2 className="text-xl font-bold text-text-primary">About You</h2>
            <Input
              label="Name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Your name"
            />
            <Input
              label="Age"
              type="number"
              inputMode="numeric"
              value={data.age}
              onChange={(e) => setData({ ...data, age: e.target.value })}
              placeholder="25"
            />
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Height
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  value={data.heightFeet}
                  onChange={(e) =>
                    setData({ ...data, heightFeet: e.target.value })
                  }
                  className="w-20 rounded-xl bg-bg-elevated border border-border px-3 py-3 text-center text-text-primary outline-none focus:border-accent"
                />
                <span className="text-text-secondary text-sm">ft</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={data.heightInches}
                  onChange={(e) =>
                    setData({ ...data, heightInches: e.target.value })
                  }
                  className="w-20 rounded-xl bg-bg-elevated border border-border px-3 py-3 text-center text-text-primary outline-none focus:border-accent"
                />
                <span className="text-text-secondary text-sm">in</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Gender
              </label>
              <div className="flex gap-2">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setData({ ...data, gender: g })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize ${
                      data.gender === g
                        ? 'bg-accent text-white'
                        : 'bg-bg-elevated text-text-secondary border border-border'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Experience Level
              </label>
              <div className="flex gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setData({ ...data, experienceLevel: level })
                    }
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize ${
                      data.experienceLevel === level
                        ? 'bg-accent text-white'
                        : 'bg-bg-elevated text-text-secondary border border-border'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-6 space-y-5">
            <h2 className="text-xl font-bold text-text-primary">
              Fitness Goals
            </h2>
            <p className="text-sm text-text-secondary">
              Select all that apply
            </p>
            <div className="space-y-2">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium ${
                    data.goals.includes(goal)
                      ? 'bg-accent/20 text-accent border border-accent'
                      : 'bg-bg-elevated text-text-secondary border border-border'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">
                Training Frequency (days/week)
              </label>
              <div className="flex gap-2">
                {['3', '4', '5', '6'].map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      setData({ ...data, trainingFrequency: f, workoutDays: defaultDaysForFrequency(parseInt(f)) })
                    }
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                      data.trainingFrequency === f
                        ? 'bg-accent text-white'
                        : 'bg-bg-elevated text-text-secondary border border-border'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Injuries or Limitations (optional)"
              value={data.injuries}
              onChange={(e) => setData({ ...data, injuries: e.target.value })}
              placeholder="e.g., bad left shoulder"
            />
          </div>
        )}

        {step === 3 && (
          <div className="py-6 space-y-5">
            <h2 className="text-xl font-bold text-text-primary">
              Training Days
            </h2>
            <p className="text-sm text-text-secondary">
              Which days of the week will you train? Your Push/Pull/Legs cycle
              will advance only on these days.
            </p>
            <DayPicker
              selectedDays={data.workoutDays}
              onChange={(days) => setData({ ...data, workoutDays: days })}
            />
            <p className="text-xs text-text-muted">
              {data.workoutDays.length === 0
                ? 'Select at least one day'
                : data.workoutDays.length === 7
                  ? 'Training every day — no rest days'
                  : `${data.workoutDays.length} days/week · ${7 - data.workoutDays.length} rest days`}
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="py-6 space-y-5">
            <h2 className="text-xl font-bold text-text-primary">
              Available Equipment
            </h2>
            <p className="text-sm text-text-secondary">
              Select all equipment you have access to
            </p>
            <div className="space-y-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium capitalize ${
                    data.equipment.includes(eq)
                      ? 'bg-accent/20 text-accent border border-accent'
                      : 'bg-bg-elevated text-text-secondary border border-border'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-6">🚀</span>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              You're All Set!
            </h2>
            <p className="text-text-secondary max-w-xs mb-4">
              Your Push/Pull/Legs rotation starts today. Head to the Workouts
              tab to begin your first session.
            </p>
            <Card className="w-full text-left">
              <div className="space-y-1.5 text-sm">
                <p className="text-text-secondary">
                  <span className="text-text-primary font-medium">{data.name}</span>
                </p>
                <p className="text-text-secondary">
                  {data.experienceLevel} · {data.trainingFrequency} days/week
                </p>
                <p className="text-text-secondary">
                  Goals: {data.goals.join(', ') || 'None selected'}
                </p>
                <p className="text-text-secondary">
                  Equipment: {data.equipment.join(', ')}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="safe-bottom px-4 pb-4 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={prev}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            className="flex-1"
            onClick={next}
            disabled={(step === 1 && !data.name) || (step === 3 && data.workoutDays.length === 0)}
          >
            {step === 0 ? "Let's Go" : 'Next'}
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleComplete}>
            Start Training
          </Button>
        )}
      </div>
    </div>
  );
}
