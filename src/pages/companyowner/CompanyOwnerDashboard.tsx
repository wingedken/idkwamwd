import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Users, Building, CheckSquare, FileText, BarChart3, Settings } from 'lucide-react';
import Layout from '../../components/common/Layout';
import Sidebar from '../../components/common/Sidebar';
import CompanyOverview from './CompanyOverview';
import EmployeeManagement from './EmployeeManagement';
import CustomerManagement from './CustomerManagement';
import TaskManagement from './TaskManagement';
import Invoicing from './Invoicing';
import Reports from './Reports';
import CompanySettings from './CompanySettings';

const sidebarItems = [
  { icon: Home, label: 'Overblik', to: '/virksomhedsejer/overview' },
  { icon: Users, label: 'Medarbejdere', to: '/virksomhedsejer/employees' },
  { icon: Building, label: 'Kunder', to: '/virksomhedsejer/customers' },
  { icon: CheckSquare, label: 'Opgaver & Ruter', to: '/virksomhedsejer/tasks' },
  { icon: FileText, label: 'Fakturering', to: '/virksomhedsejer/invoicing' },
  { icon: BarChart3, label: 'Rapporter', to: '/virksomhedsejer/reports' },
  { icon: Settings, label: 'Indstillinger', to: '/virksomhedsejer/settings' },
];

export default function CompanyOwnerDashboard() {
  return (
    <Layout
      title="Virksomhedsejer Dashboard"
      sidebar={<Sidebar items={sidebarItems} />}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/virksomhedsejer/overview" />} />
        <Route path="/overview" element={<CompanyOverview />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/invoicing" element={<Invoicing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<CompanySettings />} />
      </Routes>
    </Layout>
  );
}