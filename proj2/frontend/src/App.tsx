import { Routes, Route } from 'react-router';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
