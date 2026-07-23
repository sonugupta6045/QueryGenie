import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleGuard } from '../components/common/RoleGuard';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChatPage from '../pages/chat/ChatPage';
import DataSourceListPage from '../pages/datasources/DataSourceListPage';
import DataSourceRegisterPage from '../pages/datasources/DataSourceRegisterPage';
import DataSourceDetailPage from '../pages/datasources/DataSourceDetailPage';
import QueryHistoryPage from '../pages/history/QueryHistoryPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsageAnalyticsPage from '../pages/admin/UsageAnalyticsPage';
import UserManagementPage from '../pages/admin/UserManagementPage';

// Layout
import AppShell from '../components/layout/AppShell';

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <RegisterPage />} 
      />

      {/* Protected Routes inside AppShell */}
      <Route path="/" element={<RoleGuard><AppShell /></RoleGuard>}>
        <Route index element={<Navigate to="/chat" replace />} />
        
        {/* Chat - most roles */}
        <Route 
          path="chat" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST']}>
              <ChatPage />
            </RoleGuard>
          } 
        />

        {/* History - most roles */}
        <Route 
          path="history" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST']}>
              <QueryHistoryPage />
            </RoleGuard>
          } 
        />

        {/* Data Sources - Admins only */}
        <Route 
          path="data-sources" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'DATA_SOURCE_ADMIN']}>
              <DataSourceListPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="data-sources/new" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'DATA_SOURCE_ADMIN']}>
              <DataSourceRegisterPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="data-sources/:id" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'DATA_SOURCE_ADMIN']}>
              <DataSourceDetailPage />
            </RoleGuard>
          } 
        />

        {/* Admin Dashboard - SUPER_ADMIN only */}
        <Route 
          path="admin" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <AdminDashboardPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="admin/users" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <UserManagementPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="admin/analytics" 
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN']}>
              <UsageAnalyticsPage />
            </RoleGuard>
          } 
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
