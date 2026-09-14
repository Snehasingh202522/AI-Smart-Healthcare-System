import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

const DashboardLayout = ({ role, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      <Sidebar role={role} />
      <div className="ml-64 transition-all duration-300">
        <DashboardNavbar title={title} />
        <main className="p-4 lg:p-6 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
