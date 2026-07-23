import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, History, Database, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { clearCredentials } from '../../store/slices/authSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { role, user } = useAuth();

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) {
        await authApi.logout({ refreshToken: rt });
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(clearCredentials());
    }
  };

  const menuItems = [
    { name: 'Chat', path: '/chat', icon: MessageSquare, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST'] },
    { name: 'History', path: '/history', icon: History, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST'] },
    { name: 'Data Sources', path: '/data-sources', icon: Database, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN'] },
    { name: 'Admin', path: '/admin', icon: Shield, roles: ['SUPER_ADMIN'] },
  ];

  return (
    <aside className={`flex flex-col transition-all duration-300 bg-white border-r border-gray-200 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {sidebarOpen && <span className="text-xl font-bold text-primary-main truncate">QueryGenie</span>}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems
          .filter(item => item.roles.includes(role as string))
          .map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-main/10 text-primary-main' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={20} className={sidebarOpen ? 'mr-3' : 'mx-auto'} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {sidebarOpen ? (
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
             <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center'}`}
        >
          <LogOut size={20} className={sidebarOpen ? 'mr-3' : ''} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
