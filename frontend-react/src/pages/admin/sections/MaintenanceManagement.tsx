import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/features/SearchBar';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const maintenanceSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  type: z.nativeEnum(MaintenanceType),
  description: z.string().optional(),
  cost: z.string().optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const MaintenanceManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [maintenanceData, equipmentData] = await Promise.all([
        statusFilter === 'All'
          ? apiClient.getScheduledMaintenance()
          : apiClient.getScheduledMaintenance(),
        apiClient.getAllEquipment(),
      ]);
      setMaintenance(maintenanceData);
      setEquipment(equipmentData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load maintenance records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (data: MaintenanceFormData) => {
    try {
      await apiClient.scheduleMaintenance({
        equipmentId: parseInt(data.equipmentId),
        type: data.type,
        description: data.description,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        scheduledDate: data.scheduledDate,
      });
      showToast('Maintenance scheduled successfully', 'success');
      setIsModalOpen(false);
      reset();
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to schedule maintenance', 'error');
    }
  };

  const handleStart = async (id: number) => {
    try {
      await apiClient.startMaintenance(id);
      showToast('Maintenance started', 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to start maintenance', 'error');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await apiClient.completeMaintenance(id);
      showToast('Maintenance completed', 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to complete maintenance', 'error');
    }
  };

  const filteredMaintenance = maintenance.filter((record) => {
    const matchesSearch =
      record.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const equipmentOptions = equipment.map((eq) => ({
    value: eq.id.toString(),
    label: `${eq.bezeichnung} (${eq.inventarnummer})`,
  }));

  const typeOptions = Object.values(MaintenanceType).map((type) => ({
    value: type,
    label: type,
  }));

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    ...Object.values(MaintenanceStatus).map((status) => ({ value: status, label: status })),
  ];

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return <CheckCircle size={16} className="text-success" />;
      case MaintenanceStatus.CANCELLED:
        return <XCircle size={16} className="text-danger" />;
      case MaintenanceStatus.IN_PROGRESS:
        return <Wrench size={16} className="text-primary" />;
      default:
        return <Calendar size={16} className="text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Maintenance Management</h1>
          <p className="text-text-secondary mt-1">Schedule and track equipment maintenance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} /> Schedule Maintenance
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search maintenance..."
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full lg:w-48"
        />
      </div>

      {/* Maintenance List */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : filteredMaintenance.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-secondary text-sm">No maintenance records found.</p>
          </div>
        ) : (
          filteredMaintenance.map((record) => (
            <div
              key={record.id}
              className="bg-surface border border-border rounded-xl p-4 hover:border-text-secondary/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(record.status)}
                    <h3 className="text-text-primary font-medium">
                      {record.equipmentName || `Equipment #${record.equipmentId}`}
                    </h3>
                    <Badge variant="default">{record.type}</Badge>
                    <Badge
                      variant={
                        record.status === MaintenanceStatus.COMPLETED
                          ? 'success'
                          : record.status === MaintenanceStatus.CANCELLED
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                  {record.description && (
                    <p className="text-text-secondary text-sm mb-2">{record.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span>Scheduled: {format(new Date(record.scheduledDate), 'MMM d, yyyy')}</span>
                    {record.cost && <span>Cost: ${record.cost}</span>}
                    {record.performedBy && <span>By: {record.performedBy}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {record.status === MaintenanceStatus.SCHEDULED && (
                    <Button size="sm" onClick={() => handleStart(record.id)}>
                      Start
                    </Button>
                  )}
                  {record.status === MaintenanceStatus.IN_PROGRESS && (
                    <Button size="sm" onClick={() => handleComplete(record.id)}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Maintenance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Maintenance">
        <form onSubmit={handleSubmit(handleSchedule)} className="p-6 space-y-6">
          <Select
            label="Equipment"
            options={equipmentOptions}
            error={errors.equipmentId?.message}
            {...register('equipmentId')}
          />

          <Select
            label="Type"
            options={typeOptions}
            error={errors.type?.message}
            {...register('type')}
          />

          <Input
            label="Description"
            placeholder="Maintenance description"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Cost"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.cost?.message}
            {...register('cost')}
          />

          <Input
            label="Scheduled Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            error={errors.scheduledDate?.message}
            {...register('scheduledDate')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
              type="button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

