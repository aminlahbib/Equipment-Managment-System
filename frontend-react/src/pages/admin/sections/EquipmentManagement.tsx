import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EquipmentCard } from '../../../components/features/EquipmentCard';
import { SearchBar } from '../../../components/features/SearchBar';
import { ViewToggle } from '../../../components/features/ViewToggle';
import { CategoryFilter } from '../../../components/features/CategoryFilter';
import { Select } from '../../../components/ui/Select';
import { EquipmentModal } from '../../../components/admin/EquipmentModal';
import { EquipmentDetailsModal } from '../../../components/features/EquipmentDetailsModal';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { Equipment, EquipmentStatus } from '../../../types';

export const EquipmentManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllEquipment();
      setEquipment(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load equipment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingEquipment) {
        await apiClient.updateEquipment(editingEquipment.id, formData);
        showToast('Equipment updated successfully', 'success');
      } else {
        await apiClient.addEquipment(formData);
        showToast('Equipment added successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingEquipment(null);
      await loadEquipment();
    } catch (error: any) {
      showToast(error.message || 'Failed to save equipment', 'error');
    }
  };

  const handleDelete = async (equipmentId: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await apiClient.deleteEquipment(equipmentId);
        showToast('Equipment deleted successfully', 'success');
        await loadEquipment();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete equipment', 'error');
      }
    }
  };

  const categories = ['All', ...Array.from(new Set(equipment.map((item) => item.category).filter((cat): cat is string => Boolean(cat))))];
  const statuses = ['All', ...Object.values(EquipmentStatus)];

  const filteredEquipment = equipment.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
    const matchesSearch =
      item.bezeichnung.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inventarnummer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specs?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Equipment Management</h1>
          <p className="text-text-secondary mt-1">Manage all equipment assets</p>
        </div>
        <Button onClick={() => {
          setEditingEquipment(null);
          setIsModalOpen(true);
        }} className="gap-2">
          <Plus size={16} /> Add Equipment
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search inventory..." />
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <Select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            options={statuses.map((s) => ({ value: s, label: s }))}
            className="w-full sm:w-auto"
          />
        </div>
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Equipment Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-3'
        }
      >
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`bg-surfaceHighlight animate-pulse rounded-xl ${
                viewMode === 'grid' ? 'aspect-[4/3]' : 'h-20'
              }`}
            />
          ))
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-secondary text-sm">No equipment found.</p>
          </div>
        ) : (
          filteredEquipment.map((item) => (
            <div key={item.id} className="relative group">
              <EquipmentCard
                equipment={item}
                viewMode={viewMode}
                onClick={() => setSelectedEquipment(item)}
              />
              {viewMode === 'grid' && (
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEquipment(item);
                      setIsModalOpen(true);
                    }}
                    className="h-8 w-8"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEquipment(null);
        }}
        onSave={handleSave}
        equipment={editingEquipment}
      />

      <EquipmentDetailsModal
        equipment={selectedEquipment}
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />
    </div>
  );
};

