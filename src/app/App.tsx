import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
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
import type { Role } from '../types';

function roleHome(role: Role) {
  return role === 'ADMIN'
    ? '/admin/users'
    : role === 'TA'
      ? '/ta/labs'
      : '/student/classes';
}

function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

function LoginRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">Đang tải...</div>
    );
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

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
          element={<Navigate to={roleHome(user.role)} replace />}
        />
        <Route
          path="/admin/users"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminClassesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/student/classes"
          element={
            <RoleGuard allowedRoles={['STU']}>
              <StudentClassesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/ta/classes"
          element={
            <RoleGuard allowedRoles={['TA']}>
              <TaClassesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/ta/labs"
          element={
            <RoleGuard allowedRoles={['TA']}>
              <TaLabsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/ta/labs/new"
          element={
            <RoleGuard allowedRoles={['TA']}>
              <CreateLabPage />
            </RoleGuard>
          }
        />
        <Route
          path="/labs/:labId"
          element={
            <RoleGuard allowedRoles={['STU', 'TA']}>
              <LabDetailPage />
            </RoleGuard>
          }
        />
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
        <Route
          path="/login"
          element={
            <LoginRoute>
              <AuthPage />
            </LoginRoute>
          }
        />
        <Route path="/*" element={<Protected />} />
      </Routes>
    </AuthProvider>
  );
}
