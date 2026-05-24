import { createBrowserRouter, Navigate } from 'react-router';

import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotesPage } from '@/pages/NotesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TicketDetailPage } from '@/pages/TicketDetailPage';
import { TicketListPage } from '@/pages/TicketListPage';
import { AgentProfilePage } from '@/pages/admin/AgentProfilePage';
import { AgentsPage } from '@/pages/admin/AgentsPage';
import { ChannelEditPage } from '@/pages/admin/ChannelEditPage';
import { ChannelsPage } from '@/pages/admin/ChannelsPage';
import { TagsPage } from '@/pages/admin/TagsPage';
import { TemplateEditPage } from '@/pages/admin/TemplateEditPage';
import { TemplatesPage } from '@/pages/admin/TemplatesPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/tickets" replace /> },
  { path: '/tickets', Component: TicketListPage },
  { path: '/tickets/:id', Component: TicketDetailPage },
  { path: '/tickets/:id/notes', Component: NotesPage },
  { path: '/agents/me', Component: ProfilePage },
  { path: '/admin', element: <AdminGuard><AdminPage /></AdminGuard> },
  { path: '/admin/agents', element: <AdminGuard><AgentsPage /></AdminGuard> },
  { path: '/admin/agents/:id', element: <AdminGuard><AgentProfilePage /></AdminGuard> },
  { path: '/admin/tags', element: <AdminGuard><TagsPage /></AdminGuard> },
  { path: '/admin/templates', element: <AdminGuard><TemplatesPage /></AdminGuard> },
  { path: '/admin/templates/:id', element: <AdminGuard><TemplateEditPage /></AdminGuard> },
  { path: '/admin/channels', element: <AdminGuard><ChannelsPage /></AdminGuard> },
  { path: '/admin/channels/:id', element: <AdminGuard><ChannelEditPage /></AdminGuard> },
  { path: '*', Component: NotFoundPage },
]);
