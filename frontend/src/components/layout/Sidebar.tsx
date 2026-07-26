import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, History, Database, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { clearCredentials } from '../../store/slices/authSlice';
import Logo from '../common/Logo';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { role, user } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(clearCredentials());
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { name: 'Chat', path: '/chat', icon: MessageSquare, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST'] },
    { name: 'History', path: '/history', icon: History, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN', 'ANALYST'] },
    { name: 'Data Sources', path: '/data-sources', icon: Database, roles: ['SUPER_ADMIN', 'DATA_SOURCE_ADMIN'] },
    { name: 'Admin', path: '/admin', icon: Shield, roles: ['SUPER_ADMIN'] },
  ];

  return (
    <aside className={`flex flex-col transition-all duration-300 bg-surface border-r border-border ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {sidebarOpen ? (
          <Logo size="sm" showSubtitle={false} />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto">
            <Database className="w-4 h-4 text-white" />
          </div>
        )}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
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
                  `flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-subtle text-primary-main' 
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                  }`
                }
              >
                <Icon size={18} className={sidebarOpen ? 'mr-3' : 'mx-auto'} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
      </nav>

      <div className="p-4 border-t border-border">
        {sidebarOpen ? (
          <div className="flex items-center mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-main text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary truncate">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
             <div className="w-8 h-8 rounded-full bg-primary-main text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 text-sm font-semibold text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${!sidebarOpen && 'justify-center'}`}
        >
          <LogOut size={18} className={sidebarOpen ? 'mr-3' : ''} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
