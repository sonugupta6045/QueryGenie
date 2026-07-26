import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserResponse } from '../../types/admin';
import { Role } from '../../types/auth';
import { Mail, Calendar, Search, Filter, Users, ArrowLeft } from 'lucide-react';
import UserRoleEditor from '../../components/admin/UserRoleEditor';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page],
    queryFn: () => adminApi.listUsers(page, 20),
  });

  const filteredUsers = useMemo(() => {
    if (!data?.content) return [];
    return data.content.filter((u: UserResponse) => {
      const matchesSearch =
        !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data?.content, search, roleFilter]);

  const { mutate: updateUserRole, isPending: isUpdating } = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) => adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleRoleChange = (userId: number, newRole: Role) => {
    updateUserRole({ userId, role: newRole });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Admin Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">User Management</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage system users and their access roles.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-surface rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-main focus:border-primary-main shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-text-secondary h-4 w-4" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-border bg-surface rounded-lg text-sm font-medium text-text-primary py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary-main focus:border-primary-main shadow-sm transition-colors"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="DATA_SOURCE_ADMIN">Data Source Admin</option>
            <option value="ANALYST">Analyst</option>
          </select>
        </div>
      </div>

      {error && <ErrorBanner error={(error as any)?.response?.data?.error} />}

      {isLoading ? (
        <PageSpinner />
      ) : data ? (
        <div className="bg-surface shadow-sm border border-border rounded-xl overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-surface">
              <Users className="mx-auto h-12 w-12 text-text-secondary" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">No users found</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {search || roleFilter ? 'Try adjusting your search query or role filter.' : 'No users registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredUsers.map((user: UserResponse) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary-main font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center font-medium">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserRoleEditor
                          currentRole={user.role}
                          isUpdating={isUpdating}
                          onRoleChange={(newRole) => handleRoleChange(user.id, newRole)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          N/A
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{data.number + 1}</span> of <span className="font-medium">{data.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={data.number === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={data.number >= data.totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}