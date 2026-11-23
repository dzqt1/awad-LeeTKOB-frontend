import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import AppShell from './AppShell';
import AuthPage from '../features/auth/AuthPage';
import AdminUsersPage from '../features/admin/AdminUsersPage';
import AdminClassesPage from '../features/admin/AdminClassesPage';
import StudentClassesPage from '../features/student/StudentClassesPage';
import TaLabsPage from '../features/ta/TaLabsPage';
import LabDetailPage from '../features/labs/LabDetailPage';
import ProfilePage from '../features/profile/ProfilePage';
import CreateLabPage from '../features/ta/CreateLabPage';
import TaClassesPage from '../features/ta/TaClassesPage';
function Protected() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">Đang tải...</div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                user.role === 'ADMIN'
                  ? '/admin/users'
                  : user.role === 'TA'
                    ? '/ta/labs'
                    : '/student/classes'
              }
              replace
            />
          }
        />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/classes" element={<AdminClassesPage />} />
        <Route path="/student/classes" element={<StudentClassesPage />} />
        <Route path="/ta/classes" element={<TaClassesPage />} />
        <Route path="/ta/labs" element={<TaLabsPage />} />
        <Route path="/ta/labs/new" element={<CreateLabPage />} />
        <Route path="/labs/:labId" element={<LabDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/*" element={<Protected />} />
      </Routes>
    </AuthProvider>
  );
}
