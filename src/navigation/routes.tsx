import { createBrowserRouter, Navigate } from 'react-router';

import { AdminGuard } from '@/components/AdminGuard';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/tickets" replace /> },
  {
    path: '/tickets',
    lazy: async () => ({ Component: (await import('@/pages/TicketListPage')).TicketListPage }),
  },
  {
    path: '/tickets/:id',
    lazy: async () => ({ Component: (await import('@/pages/TicketDetailPage')).TicketDetailPage }),
  },
  {
    path: '/tickets/:id/notes',
    lazy: async () => ({ Component: (await import('@/pages/NotesPage')).NotesPage }),
  },
  {
    path: '/agents/me',
    lazy: async () => ({ Component: (await import('@/pages/ProfilePage')).ProfilePage }),
  },
  {
    path: '/agents/:id',
    lazy: async () => ({ Component: (await import('@/pages/admin/AgentProfilePage')).AgentProfilePage }),
  },
  {
    path: '/admin',
    lazy: async () => {
      const { AdminPage } = await import('@/pages/AdminPage');
      return { element: <AdminGuard><AdminPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/agents',
    lazy: async () => {
      const { AgentsPage } = await import('@/pages/admin/AgentsPage');
      return { element: <AdminGuard><AgentsPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/tags',
    lazy: async () => {
      const { TagsPage } = await import('@/pages/admin/TagsPage');
      return { element: <AdminGuard><TagsPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/templates',
    lazy: async () => {
      const { TemplatesPage } = await import('@/pages/admin/TemplatesPage');
      return { element: <AdminGuard><TemplatesPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/templates/:id',
    lazy: async () => {
      const { TemplateEditPage } = await import('@/pages/admin/TemplateEditPage');
      return { element: <AdminGuard><TemplateEditPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/channels',
    lazy: async () => {
      const { ChannelsPage } = await import('@/pages/admin/ChannelsPage');
      return { element: <AdminGuard><ChannelsPage /></AdminGuard> };
    },
  },
  {
    path: '/admin/channels/:id',
    lazy: async () => {
      const { ChannelEditPage } = await import('@/pages/admin/ChannelEditPage');
      return { element: <AdminGuard><ChannelEditPage /></AdminGuard> };
    },
  },
  { path: '*', Component: NotFoundPage },
]);
