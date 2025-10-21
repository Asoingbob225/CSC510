import { Routes, Route } from 'react-router';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
}

export default App;
