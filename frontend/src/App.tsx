import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { CriticalAlertModal } from './components/emergency/CriticalAlertModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveCameraGrid } from './components/live/LiveCameraGrid';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ZoneManagementPage } from './pages/ZoneManagementPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { ExaminerToolbar } from './components/simulation/ExaminerToolbar';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AcademicReportPage } from './pages/AcademicReportPage';
import { CameraManagementPage } from './pages/CameraManagementPage';
import { GalleryPage } from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutUsPage } from './pages/AboutUsPage';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Global Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Global Emergency Alert Modal & Floating Real-Time Toasts */}
      <CriticalAlertModal
        onViewCamera={(camId) => setCurrentTab('live')}
        onViewIncident={(incId) => {
          setSelectedIncidentId(incId);
          setCurrentTab('incidents');
        }}
      />
      <ToastContainer />

      {/* Active Page View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'landing' && <LandingPage onEnterApp={(tab) => setCurrentTab(tab || 'dashboard')} />}
        {currentTab === 'dashboard' && <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />}
        {currentTab === 'live' && <LiveCameraGrid />}
        {currentTab === 'incidents' && (
          <IncidentHistoryPage
            initialSelectedId={selectedIncidentId}
            onClearSelection={() => setSelectedIncidentId(null)}
          />
        )}
        {currentTab === 'analytics' && <AnalyticsPage />}
        {currentTab === 'zones' && <ZoneManagementPage />}
        {currentTab === 'iot' && <DeviceManagementPage />}
        {currentTab === 'cameras' && <CameraManagementPage />}
        {currentTab === 'simulation' && <ExaminerToolbar />}
        {currentTab === 'settings' && <AdminPanelPage />}
        {currentTab === 'report' && <AcademicReportPage />}
        {currentTab === 'gallery' && <GalleryPage />}
        {currentTab === 'profile' && <ProfilePage />}
        {currentTab === 'about' && <AboutUsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WildGuard AI &bull; Intelligent Wildlife Harm & Intrusion Detection System</span>
          <span className="text-emerald-400 font-mono">Ethical Non-Harm Safeguards Active</span>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <MainApp />
      </AlertProvider>
    </AuthProvider>
  );
}
