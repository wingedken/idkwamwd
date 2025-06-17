import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Users, BarChart3, Settings } from 'lucide-react';
import Layout from '../../components/common/Layout';
import Sidebar from '../../components/common/Sidebar';
import AdminUsers from './AdminUsers';
import AdminStats from './AdminStats';
import AdminSettings from './AdminSettings';

const sidebarItems = [
  { icon: Users, label: 'Virksomhedsejere', to: '/admin/users' },
  { icon: BarChart3, label: 'Statistik', to: '/admin/stats' },
  { icon: Settings, label: 'Indstillinger', to: '/admin/settings' },
];

export default function AdminDashboard() {
  return (
    <Layout
      title="Admin Dashboard"
      sidebar={<Sidebar items={sidebarItems} />}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/users" />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/stats" element={<AdminStats />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </Layout>
  );
}