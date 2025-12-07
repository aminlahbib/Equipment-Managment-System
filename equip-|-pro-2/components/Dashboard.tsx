import React, { useState, useEffect, useRef } from 'react';
import { Plus, RotateCcw, Zap, Check, Search, RefreshCw, Layers, ArrowUpRight, AlertTriangle, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import { Modal } from './ui/Modal';
import { Toast, ToastMessage } from './ui/Toast';
import { MOCK_EQUIPMENT, MOCK_LOANS, CURRENT_USER } from '../constants';
import { EquipmentStatus, Equipment, Loan } from '../types';

type SortOption = {
  label: string;
  key: keyof Loan;
  direction: 'asc' | 'desc';
};

export const Dashboard: React.FC = () => {
  // Data State
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loanData, setLoanData] = useState<Loan[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isEquipmentRefreshing, setIsEquipmentRefreshing] = useState(false);
  
  // UI States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [returningIds, setReturningIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Sort State
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortOption>({ 
    label: 'Due Soonest', 
    key: 'dueDate', 
    direction: 'asc' 
  });
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...Array.from(new Set(MOCK_EQUIPMENT.map(item => item.category)))];

  const filteredEquipment = equipmentData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedLoans = [...loanData].sort((a, b) => {
    const dateA = new Date(a[sortConfig.key] as string).getTime();
    const dateB = new Date(b[sortConfig.key] as string).getTime();
    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setEquipmentData(MOCK_EQUIPMENT);
      setLoanData(MOCK_LOANS);
      setIsGlobalLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshEquipment = () => {
    setIsEquipmentRefreshing(true);
    setTimeout(() => {
      setEquipmentData(MOCK_EQUIPMENT);
      setSearchQuery('');
      setActiveCategory('All');
      setIsEquipmentRefreshing(false);
    }, 800);
  };

  const handleReturn = (e: React.MouseEvent, loan: Loan) => {
    e.stopPropagation();
    if (window.confirm(`Return ${loan.equipmentName}?`)) {
      setLoanData(prev => prev.filter(l => l.id !== loan.id));
      addToast(`${loan.equipmentName} returned`);
    }
  };

  const handleQuickReturn = (e: React.MouseEvent, loan: Loan) => {
    e.stopPropagation();
    setReturningIds(prev => new Set(prev).add(loan.id));
    setTimeout(() => {
      setLoanData(prev => prev.filter(l => l.id !== loan.id));
      setReturningIds(prev => {
        const next = new Set(prev);
        next.delete(loan.id);
        return next;
      });
      addToast(`${loan.equipmentName} returned`, 'success');
    }, 400);
  };

  const handleReturnAll = () => {
    const activeLoanCount = loanData.filter(l => l.status === 'Active' || l.status === 'Overdue').length;
    if (activeLoanCount === 0) return;
    if (window.confirm(`Return all active loans?`)) {
      setLoanData([]);
      addToast(`Returned all items`);
    }
  };

  const availableCount = equipmentData.filter(e => e.status === EquipmentStatus.AVAILABLE).length;
  const borrowedCount = equipmentData.filter(e => e.status === EquipmentStatus.BORROWED).length;
  const overdueCount = loanData.filter(l => l.status === 'Overdue').length;

  const Skeleton: React.FC<{ className: string }> = ({ className }) => (
    <div className={`bg-surfaceHighlight animate-pulse rounded-lg ${className}`} />
  );

  const sortOptions: SortOption[] = [
    { label: 'Due Soonest', key: 'dueDate', direction: 'asc' },
    { label: 'Due Latest', key: 'dueDate', direction: 'desc' },
    { label: 'Recent Loans', key: 'borrowDate', direction: 'desc' },
  ];

  return (
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Overview for {CURRENT_USER.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={refreshEquipment} className="h-10 w-10 p-0 rounded-full">
            <RefreshCw size={16} className={`text-text-secondary ${isEquipmentRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="md" className="h-10 gap-2">
            <Plus size={16} /> New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Available Items', value: availableCount, icon: Layers, color: 'text-primary' },
          { label: 'Active Loans', value: borrowedCount, icon: ArrowUpRight, color: 'text-text-primary' },
          { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'text-danger', active: overdueCount > 0 }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 flex items-start justify-between hover:border-text-secondary/20 transition-colors">
            <div>
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              {isGlobalLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className={`text-3xl font-semibold mt-2 ${stat.active ? 'text-danger' : 'text-text-primary'}`}>
                  {stat.value}
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg bg-surfaceHighlight ${stat.active ? 'text-danger' : 'text-text-secondary'}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             {/* Categories */}
             <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-surfaceHighlight text-text-primary shadow-sm' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
               {/* Search */}
               <div className="relative group flex-1 sm:w-64">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-text-primary transition-colors" />
                 <input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search..."
                   className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-secondary/30 transition-all"
                 />
               </div>

               {/* View Toggle */}
               <div className="flex items-center p-1 bg-surface border border-border rounded-lg shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-surfaceHighlight text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-surfaceHighlight text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    <List size={14} />
                  </button>
               </div>
             </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "flex flex-col gap-3"}>
            {isGlobalLoading ? (
               [1,2,3,4].map(i => <Skeleton key={i} className={viewMode === 'grid' ? "aspect-[4/3] rounded-xl" : "h-20 w-full rounded-xl"} />)
            ) : filteredEquipment.length === 0 ? (
               <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
                 <p className="text-text-secondary text-sm">No equipment found matching your criteria.</p>
                 <button onClick={() => {setSearchQuery(''); setActiveCategory('All');}} className="text-primary mt-2 text-sm hover:underline">Clear filters</button>
               </div>
            ) : (
              filteredEquipment.map((item) => (
                viewMode === 'grid' ? (
                  // GRID VIEW
                  <div 
                    key={item.id} 
                    className="group cursor-pointer bg-surface border border-border rounded-xl overflow-hidden hover:border-text-secondary/20 transition-all duration-300"
                    onClick={() => setSelectedEquipment(item)}
                  >
                    <div className="aspect-[3/2] w-full bg-surfaceHighlight relative overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-sm ${
                               item.status === EquipmentStatus.AVAILABLE 
                               ? 'bg-success/10 text-success border-success/20' 
                               : item.status === EquipmentStatus.BORROWED
                               ? 'bg-surface/80 text-text-secondary border-border'
                               : 'bg-danger/10 text-danger border-danger/20'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-text-primary font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-text-secondary text-xs mt-1 truncate">{item.specs}</p>
                    </div>
                  </div>
                ) : (
                  // LIST VIEW
                  <div 
                    key={item.id}
                    className="group cursor-pointer bg-surface border border-border rounded-xl p-3 flex items-center gap-4 hover:border-text-secondary/20 transition-all duration-200"
                    onClick={() => setSelectedEquipment(item)}
                  >
                    <div className="w-16 h-12 bg-surfaceHighlight rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-text-primary font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-text-secondary text-xs mt-0.5 truncate">{item.specs}</p>
                    </div>
                    <div className="hidden sm:block text-xs text-text-tertiary px-4 border-l border-border">
                      {item.category}
                    </div>
                    <div className="shrink-0 pl-2">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                             item.status === EquipmentStatus.AVAILABLE 
                             ? 'bg-success/10 text-success border-success/20' 
                             : item.status === EquipmentStatus.BORROWED
                             ? 'bg-surfaceHighlight text-text-secondary border-border'
                             : 'bg-danger/10 text-danger border-danger/20'
                        }`}>
                          {item.status}
                        </span>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Loans */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">Your Activity</h2>
            <div className="flex items-center gap-3">
              {/* Sort Menu */}
              <div className="relative" ref={sortMenuRef}>
                 <button 
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                 >
                   {sortConfig.label}
                   <ArrowUpDown size={12} />
                 </button>
                 {isSortMenuOpen && (
                   <div className="absolute right-0 top-full mt-2 w-36 bg-surfaceHighlight/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1 z-30 overflow-hidden flex flex-col">
                      {sortOptions.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => {
                            setSortConfig(option);
                            setIsSortMenuOpen(false);
                          }}
                          className={`text-left px-4 py-2.5 text-xs transition-colors ${
                            sortConfig.label === option.label 
                              ? 'bg-background/50 text-text-primary' 
                              : 'text-text-secondary hover:bg-background/20 hover:text-text-primary'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                   </div>
                 )}
              </div>

              {!isGlobalLoading && loanData.length > 0 && (
                <>
                  <div className="w-px h-3 bg-border"></div>
                  <button 
                    onClick={handleReturnAll} 
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Return All
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {isGlobalLoading ? (
              [1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)
            ) : loanData.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
                <div className="w-10 h-10 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-3 text-text-tertiary">
                  <Check size={16} />
                </div>
                <p className="text-text-secondary text-sm">No active loans.</p>
              </div>
            ) : (
              sortedLoans.map((loan) => (
                <div 
                  key={loan.id} 
                  className={`
                    group relative p-3 bg-surface border border-border rounded-xl flex items-center gap-3 transition-all
                    ${returningIds.has(loan.id) ? 'opacity-0 scale-95' : 'hover:border-text-secondary/20'}
                  `}
                >
                  <img src={loan.image} className="w-10 h-10 rounded-lg object-cover bg-surfaceHighlight" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary truncate">{loan.equipmentName}</h4>
                    <p className={`text-[10px] uppercase font-semibold tracking-wide mt-0.5 ${loan.status === 'Overdue' ? 'text-danger' : 'text-text-tertiary'}`}>
                      Due {new Date(loan.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Quick Return">
                      <button 
                        onClick={(e) => handleQuickReturn(e, loan)}
                        className="p-1.5 hover:bg-surfaceHighlight text-text-secondary hover:text-text-primary rounded-md transition-colors"
                      >
                        <Zap size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Return">
                       <button 
                        onClick={(e) => handleReturn(e, loan)}
                        className="p-1.5 hover:bg-surfaceHighlight text-text-secondary hover:text-text-primary rounded-md transition-colors"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal for Details */}
        <Modal 
          isOpen={!!selectedEquipment} 
          onClose={() => setSelectedEquipment(null)} 
          title="Equipment Details"
        >
          {selectedEquipment && (
            <div className="p-6 space-y-6">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-surfaceHighlight">
                 <img src={selectedEquipment.image} className="w-full h-full object-cover" alt="" />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                   <div>
                      <h2 className="text-xl font-semibold text-text-primary">{selectedEquipment.name}</h2>
                      <p className="text-text-secondary text-sm mt-1">{selectedEquipment.specs}</p>
                   </div>
                   <div className="text-right">
                       <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          selectedEquipment.status === EquipmentStatus.AVAILABLE 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-surfaceHighlight text-text-secondary border-border'
                      }`}>
                        {selectedEquipment.status}
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
                  <div>
                     <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">Asset ID</label>
                     <span className="font-mono text-sm text-text-primary">{selectedEquipment.id.toUpperCase()}</span>
                  </div>
                  <div>
                     <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">Category</label>
                     <span className="text-sm text-text-primary">{selectedEquipment.category}</span>
                  </div>
                  {selectedEquipment.status === 'Borrowed' && (
                    <>
                      <div>
                        <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">Borrower</label>
                        <span className="text-sm text-text-primary">{selectedEquipment.borrower}</span>
                      </div>
                      <div>
                        <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">Due Date</label>
                        <span className="text-sm text-text-primary">{selectedEquipment.dueDate}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" size="lg">
                     {selectedEquipment.status === EquipmentStatus.AVAILABLE ? 'Book Equipment' : 'Join Waitlist'}
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedEquipment(null)} className="flex-1">Close</Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};