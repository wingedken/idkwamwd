import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Calendar, CheckSquare, Clock, Navigation } from 'lucide-react';
import Layout from '../../components/common/Layout';
import Sidebar from '../../components/common/Sidebar';
import EmployeeToday from './EmployeeToday';
import EmployeeTasks from './EmployeeTasks';
import EmployeeTimeTracking from './EmployeeTimeTracking';
import EmployeeRoute from './EmployeeRoute';

const sidebarItems = [
  { icon: Calendar, label: 'I dag', to: '/medarbejder/today' },
  { icon: Navigation, label: 'Min rute', to: '/medarbejder/route' },
  { icon: CheckSquare, label: 'Mine opgaver', to: '/medarbejder/tasks' },
  { icon: Clock, label: 'Tidsregistrering', to: '/medarbejder/time' },
];

export default function EmployeeDashboard() {
  return (
    <Layout
      title="Medarbejder Dashboard"
      sidebar={<Sidebar items={sidebarItems} />}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/medarbejder/today" />} />
        <Route path="/today" element={<EmployeeToday />} />
        <Route path="/route" element={<EmployeeRoute />} />
        <Route path="/tasks" element={<EmployeeTasks />} />
        <Route path="/time" element={<EmployeeTimeTracking />} />
      </Routes>
    </Layout>
  );
}