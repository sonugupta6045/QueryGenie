import { Role } from '../../types/auth';
import { Shield } from 'lucide-react';

interface UserRoleEditorProps {
  currentRole: Role;
  isUpdating: boolean;
  onRoleChange: (newRole: Role) => void;
}

export default function UserRoleEditor({ currentRole, isUpdating, onRoleChange }: UserRoleEditorProps) {
  return (
    <div className="flex items-center">
      <Shield size={14} className="mr-2 text-gray-400" />
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value as Role)}
        disabled={isUpdating}
        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm rounded-md"
      >
        <option value="ANALYST">Analyst</option>
        <option value="DATA_SOURCE_ADMIN">Data Source Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>
    </div>
  );
}
