import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/features/SearchBar';
import { Select } from '../../../components/ui/Select';
import { UserModal } from '../../../components/admin/UserModal';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { User, Role, AccountStatus } from '../../../types';
import { Badge } from '../../../components/ui/Badge';

export const UserManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: { role: Role; accountStatus: AccountStatus }) => {
    if (!selectedUser) return;
    try {
      await apiClient.updateUser(selectedUser.id, formData);
      showToast('User updated successfully', 'success');
      setIsModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      showToast(error.message || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiClient.deleteUser(userId);
        showToast('User deleted successfully', 'success');
        await loadUsers();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete user', 'error');
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.benutzername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.vorname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nachname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.accountStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleOptions = [
    { value: 'All', label: 'All Roles' },
    ...Object.values(Role).map((role) => ({ value: role, label: role })),
  ];

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    ...Object.values(AccountStatus).map((status) => ({ value: status, label: status })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-1">Manage user accounts and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={roleOptions}
          className="w-full lg:w-48"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full lg:w-48"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-secondary text-sm">No users found.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between hover:border-text-secondary/20 transition-all"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-secondary font-medium shrink-0">
                  {user.vorname?.[0] || user.benutzername[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-medium truncate">
                    {user.vorname} {user.nachname}
                  </h3>
                  <p className="text-text-secondary text-sm truncate">@{user.benutzername}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={user.role === Role.ADMIN ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                  <Badge
                    variant={
                      user.accountStatus === AccountStatus.ACTIVE
                        ? 'success'
                        : user.accountStatus === AccountStatus.SUSPENDED
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {user.accountStatus}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="danger"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSave}
        user={selectedUser}
      />
    </div>
  );
};

