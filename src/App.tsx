import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { WorkoutListPage } from './components/workout/WorkoutListPage'
import { WorkoutBuilderPage } from './components/workout/WorkoutBuilderPage'
import { WorkoutDetailPage } from './components/workout/WorkoutDetailPage'
import { WorkoutPlayerPage } from './components/workout/WorkoutPlayerPage'
import { ProgressPage } from './components/progress/ProgressPage'
import { ExerciseCatalogPage } from './components/exercise/ExerciseCatalogPage'
import { ExerciseDetailPage } from './components/exercise/ExerciseDetailPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { CalendarPage } from './components/calendar/CalendarPage'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { ToastContainer } from './components/ui/Toast'
import { Spinner } from './components/ui/Spinner'
import { useIsOnboarded } from './hooks/useUserProfile'

function AppRoutes() {
  const isOnboarded = useIsOnboarded()

  if (isOnboarded === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} />
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workouts" element={<WorkoutListPage />} />
        <Route path="/workouts/new" element={<WorkoutBuilderPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
        <Route path="/workouts/:id/play" element={<WorkoutPlayerPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/exercises" element={<ExerciseCatalogPage />} />
        <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Route>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  )
}
