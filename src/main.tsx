import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { seedExercises, seedTemplates, seedTrackerPresets, migrateUTCDates } from './db/seed'

seedExercises().then(() => seedTemplates()).then(() => seedTrackerPresets()).then(() => migrateUTCDates()).catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
