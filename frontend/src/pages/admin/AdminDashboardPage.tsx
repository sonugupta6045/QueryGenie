import { Link } from 'react-router-dom';
import { Users, Activity, Settings, Database, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const cards = [
    { name: 'User Management', description: 'Manage users, roles, and access controls.', icon: Users, href: '/admin/users', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Usage Analytics', description: 'View system usage, query counts, and performance metrics.', icon: Activity, href: '/admin/analytics', color: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'Data Sources', description: 'Manage database connections and schemas.', icon: Database, href: '/data-sources', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Query History', description: 'Audit past queries and generated SQL across all users.', icon: Clock, href: '/history', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back, {user?.name}. Manage QueryGenie system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.name} to={card.href} className={`rounded-xl border p-6 flex flex-col hover:shadow-md transition-all bg-surface border-border`}>
              <div className={`p-3 rounded-lg self-start ${card.color.split(' ')[0]} ${card.color.split(' ')[1]}`}>
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-text-primary">{card.name}</h3>
              <p className="mt-2 text-sm text-text-secondary flex-1">{card.description}</p>
            </Link>
          );
        })}
      </div>
      
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-surface-secondary flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary flex items-center">
            <Settings size={18} className="mr-2 text-text-secondary" />
            System Status
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-1">
             <p className="text-sm text-gray-500 font-medium">Core API</p>
             <div className="flex items-center">
               <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
               <span className="text-sm font-semibold text-gray-900">Operational</span>
             </div>
           </div>
           <div className="space-y-1">
             <p className="text-sm text-gray-500 font-medium">LLM Service</p>
             <div className="flex items-center">
               <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
               <span className="text-sm font-semibold text-gray-900">Operational</span>
             </div>
           </div>
           <div className="space-y-1">
             <p className="text-sm text-gray-500 font-medium">Version</p>
             <div className="flex items-center">
               <span className="text-sm font-semibold text-gray-900">v1.0.0</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}