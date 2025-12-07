import React, { useState } from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Toast, ToastMessage } from './ui/Toast';
import { MOCK_EQUIPMENT } from '../constants';
import { Equipment, EquipmentStatus } from '../types';

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category)))];
  const statuses = ['All', ...Object.values(EquipmentStatus)];

  const filteredItems = inventory.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleDelete = () => {
    if (!selectedEquipment) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedEquipment.name}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      setInventory(prev => prev.filter(item => item.id !== selectedEquipment.id));
      addToast(`${selectedEquipment.name} has been deleted`, 'success');
      setSelectedEquipment(null);
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-8">
      {/* Toast Container */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Inventory</h1>
          <p className="text-text-secondary mt-1">Manage all equipment assets</p>
        </div>
        <Button size="md" className="gap-2">
            <Plus size={16} /> Add Item
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative group w-full sm:w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-text-primary transition-colors" />
             <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search inventory..."
               className="w-full bg-surfaceHighlight/50 border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-secondary/30 transition-all"
             />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
             <select 
               value={activeCategory}
               onChange={(e) => setActiveCategory(e.target.value)}
               className="h-full pl-3 pr-8 py-2 bg-surfaceHighlight/50 border border-border rounded-lg text-sm text-text-primary appearance-none focus:outline-none cursor-pointer hover:bg-surfaceHighlight"
             >
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <SlidersHorizontal size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          </div>

           {/* Status Filter */}
           <div className="relative">
             <select 
               value={activeStatus}
               onChange={(e) => setActiveStatus(e.target.value)}
               className="h-full pl-3 pr-8 py-2 bg-surfaceHighlight/50 border border-border rounded-lg text-sm text-text-primary appearance-none focus:outline-none cursor-pointer hover:bg-surfaceHighlight"
             >
               {statuses.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-text-tertiary pointer-events-none opacity-50"></div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-surfaceHighlight/50 border border-border rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid/List Content */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
        {filteredItems.map((item) => (
           <div 
             key={item.id}
             onClick={() => setSelectedEquipment(item)}
             className={`
               group cursor-pointer bg-surface border border-border rounded-xl overflow-hidden hover:border-text-secondary/20 transition-all duration-300
               ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : ''}
             `}
           >
             <div className={`${viewMode === 'list' ? 'w-20 h-16 rounded-lg' : 'aspect-[4/3] w-full'} bg-surfaceHighlight relative overflow-hidden shrink-0`}>
               <img 
                 src={item.image} 
                 alt={item.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
               />
             </div>
             
             <div className={`${viewMode === 'list' ? 'flex-1 min-w-0 flex items-center justify-between' : 'p-4'}`}>
               <div className="min-w-0">
                 <h3 className="text-text-primary font-medium text-sm truncate">{item.name}</h3>
                 <p className="text-text-secondary text-xs mt-1 truncate">{item.specs}</p>
                 {viewMode === 'grid' && <span className="text-[10px] text-text-tertiary mt-2 block uppercase tracking-wide">{item.category}</span>}
               </div>
               
               <div className={viewMode === 'list' ? 'shrink-0 flex items-center gap-6' : 'mt-4 flex justify-between items-center'}>
                  {viewMode === 'list' && <span className="text-xs text-text-tertiary hidden sm:block w-24">{item.category}</span>}
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border ${
                       item.status === EquipmentStatus.AVAILABLE 
                       ? 'bg-success/10 text-success border-success/20' 
                       : item.status === EquipmentStatus.BORROWED
                       ? 'bg-surfaceHighlight text-text-secondary border-border'
                       : 'bg-danger/10 text-danger border-danger/20'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
               </div>
             </div>
           </div>
        ))}
      </div>

      <Modal 
        isOpen={!!selectedEquipment} 
        onClose={() => setSelectedEquipment(null)} 
        title="Equipment Details"
      >
        {selectedEquipment && (
          <div className="p-6">
             <div className="aspect-video w-full rounded-xl overflow-hidden bg-surfaceHighlight mb-6">
                <img src={selectedEquipment.image} className="w-full h-full object-cover" alt="" />
             </div>
             
             <div className="mb-8">
               <h2 className="text-xl font-semibold text-text-primary">{selectedEquipment.name}</h2>
               <p className="text-text-secondary text-sm mt-1">{selectedEquipment.specs}</p>
               
               <div className="flex gap-4 mt-4 text-xs text-text-tertiary">
                 <div>
                   <span className="uppercase tracking-wider font-semibold block mb-0.5">ID</span>
                   <span className="font-mono text-text-secondary">{selectedEquipment.id.toUpperCase()}</span>
                 </div>
                 <div>
                   <span className="uppercase tracking-wider font-semibold block mb-0.5">Category</span>
                   <span className="text-text-secondary">{selectedEquipment.category}</span>
                 </div>
               </div>
             </div>

             <div className="flex gap-3 pt-4 border-t border-border">
               <Button variant="secondary" className="flex-1" onClick={() => setSelectedEquipment(null)}>
                 Cancel
               </Button>
               <Button variant="danger" className="flex-1 gap-2" onClick={handleDelete}>
                 <Trash2 size={16} /> Delete Item
               </Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};