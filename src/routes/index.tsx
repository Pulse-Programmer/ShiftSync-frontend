import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { RequireAuth, RequireRole } from './guards';
import { LoginPage } from '../pages/LoginPage';
import { DocumentationPage } from '../pages/DocumentationPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SchedulePage } from '../pages/SchedulePage';
import { StaffPage } from '../pages/StaffPage';
import { SwapsPage } from '../pages/SwapsPage';
import { OvertimePage } from '../pages/OvertimePage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { InvitationsPage } from '../pages/InvitationsPage';
import { OnDutyPage } from '../pages/OnDutyPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/docs',
    element: <DocumentationPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      {
        path: 'staff',
        element: (
          <RequireRole roles={['admin', 'manager']}>
            <StaffPage />
          </RequireRole>
        ),
      },
      { path: 'swaps', element: <SwapsPage /> },
      {
        path: 'overtime',
        element: (
          <RequireRole roles={['admin', 'manager']}>
            <OvertimePage />
          </RequireRole>
        ),
      },
      {
        path: 'analytics',
        element: (
          <RequireRole roles={['admin', 'manager']}>
            <AnalyticsPage />
          </RequireRole>
        ),
      },
      {
        path: 'on-duty',
        element: (
          <RequireRole roles={['admin', 'manager']}>
            <OnDutyPage />
          </RequireRole>
        ),
      },
      {
        path: 'invitations',
        element: (
          <RequireRole roles={['admin', 'manager']}>
            <InvitationsPage />
          </RequireRole>
        ),
      },
      {
        path: 'audit',
        element: (
          <RequireRole roles={['admin']}>
            <AuditLogPage />
          </RequireRole>
        ),
      },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
