import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { AppShell } from './components/AppShell';
import { PWAPrompt } from './components/PWAPrompt';
import { HomePage } from './pages/HomePage';
import { RecordPage } from './pages/RecordPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { FamilyPage } from './pages/FamilyPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { StageSwitchPage } from './pages/StageSwitchPage';
import { EmergencyPage } from './pages/EmergencyPage';

function App() {
  const onboarded = useAppStore((s) => s.onboarded);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PWAPrompt />
      <Routes>
        {!onboarded && <Route path="/onboarding" element={<OnboardingPage />} />}
        {!onboarded && <Route path="*" element={<Navigate to="/onboarding" replace />} />}

        {onboarded && (
          <>
            <Route path="/onboarding" element={<Navigate to="/" replace />} />
            <Route path="/stage-switch" element={<StageSwitchPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
