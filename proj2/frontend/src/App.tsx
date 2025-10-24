import { Routes, Route } from 'react-router';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import HealthProfileWizard from './pages/HealthProfileWizard';
import HealthProfilePage from './pages/HealthProfile';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health-profile-wizard" element={<HealthProfileWizard />} />
        <Route path="/health-profile" element={<HealthProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
