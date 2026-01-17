import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import './enhanced-animations.css';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ItemsPage from './pages/Items/ItemsPage';
import ReportItem from './pages/Items/ReportItem';
import ChatList from './pages/Chats/ChatList';
import ChatRoom from './pages/Chats/ChatRoom';
import ItemDetails from './pages/Items/ItemDetails';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import ReportSelection from './pages/ReportSelection';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/start" element={<ReportSelection />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/lost" element={<ItemsPage type="lost" />} />

                <Route path="/found" element={<ItemsPage type="found" />} />
                <Route path="/report/lost" element={<ReportItem type="lost" />} />
                <Route path="/report/found" element={<ReportItem type="found" />} />
                <Route path="/items/:id" element={<ItemDetails />} />
                <Route path="/chats" element={<ChatList />} />
                <Route path="/chats/:id" element={<ChatRoom />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Routes>
            </ErrorBoundary>
          </Layout>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

