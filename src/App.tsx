import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import './styles/animations.css';
import './styles/theme.css';

// استيراد المكونات بشكل كسول
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrainingPlans = lazy(() => import('./pages/TrainingPlans'));
const Videos = lazy(() => import('./pages/Videos'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--background-light)'
        }}>
          <div className="spinner"></div>
        </div>
      }>
        <div className="app-container" style={{
          minHeight: '100vh',
          background: 'var(--background-light)'
        }}>
        <Navbar />
          <main style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'var(--spacing-lg)'
          }}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training-plans" element={<TrainingPlans />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
          <footer style={{
            background: 'var(--background-card)',
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
            marginTop: 'auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} منصة التدريب الرياضي. جميع الحقوق محفوظة.
            </p>
        </footer>
      </div>
      </Suspense>
    </Router>
  );
}

export default App;