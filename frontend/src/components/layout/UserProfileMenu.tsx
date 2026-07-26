import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useDispatch } from 'react-redux';
import { User as UserIcon, LogOut, ChevronUp, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { authApi } from '../../api/authApi';
import { clearCredentials } from '../../store/slices/authSlice';

interface UserProfileMenuProps {
  sidebarOpen: boolean;
}

export default function UserProfileMenu({ sidebarOpen }: UserProfileMenuProps) {
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      dispatch(clearCredentials());
      window.location.href = '/login';
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex items-center w-full p-2 rounded-xl text-left transition-colors duration-150 group cursor-pointer focus:outline-none border border-transparent hover:border-border hover:bg-surface-secondary ${
            sidebarOpen ? 'justify-between' : 'justify-center'
          }`}
          aria-label="User account menu"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-main text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
              {userInitial}
            </div>
            {sidebarOpen && (
              <div className="truncate text-left min-w-0">
                <p className="text-sm font-extrabold text-text-primary truncate leading-snug">
                  {user?.name || 'User Account'}
                </p>
                <p className="text-xs font-semibold text-text-secondary truncate">
                  {user?.role || role || 'User'}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <ChevronUp size={16} className="text-text-secondary opacity-70 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={sidebarOpen ? 'top' : 'right'}
          sideOffset={8}
          align={sidebarOpen ? 'start' : 'end'}
          collisionPadding={12}
          className="z-50 min-w-[240px] max-w-[280px] bg-surface text-text-primary border border-border rounded-xl shadow-xl p-2 font-sans transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {/* User Header Block */}
          <div className="px-3 py-2.5 flex items-center gap-3 bg-surface-secondary/50 rounded-lg border border-border/50 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary-main text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
              {userInitial}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-sm font-extrabold text-text-primary truncate">
                {user?.name || 'User Account'}
              </p>
              <p className="text-xs text-text-secondary truncate mt-0.5" title={user?.email}>
                {user?.email || 'user@querygenie.ai'}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-subtle text-primary-main font-bold text-[10px] uppercase tracking-wider">
                  <ShieldCheck size={10} />
                  {user?.role || role || 'ANALYST'}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu.Separator className="h-px bg-border my-1.5" />

          {/* Menu Actions */}
          <DropdownMenu.Item 
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-primary rounded-lg hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none cursor-pointer transition-colors"
            onSelect={(e) => e.preventDefault()}
          >
            <UserIcon size={15} className="text-text-secondary" />
            <span>Profile & Preferences</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item 
            onClick={toggleTheme}
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary rounded-lg hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon size={15} className="text-indigo-400" />
              ) : (
                <Sun size={15} className="text-amber-500" />
              )}
              <span>Theme Mode</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-secondary text-text-secondary border border-border">
              {theme}
            </span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1.5" />

          {/* Logout Action */}
          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40 focus:outline-none cursor-pointer transition-colors"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
