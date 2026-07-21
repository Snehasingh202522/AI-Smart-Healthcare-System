import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

const DashboardLayout = ({ role, title }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar role={role} />
      <div className="ml-64 transition-all duration-300">
        <DashboardNavbar title={title} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
