import React, { useState } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { MOCK_LOANS } from '../constants';

export const Activity: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Returned' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLoans = MOCK_LOANS.filter(loan => {
    const matchesFilter = filter === 'All' || 
                          (filter === 'Active' && loan.status === 'Active') ||
                          (filter === 'Returned' && loan.status === 'Returned') ||
                          (filter === 'Overdue' && loan.status === 'Overdue');
    const matchesSearch = loan.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const Tabs = () => (
    <div className="flex gap-1 bg-surface border border-border p-1 rounded-lg w-full sm:w-auto">
      {['All', 'Active', 'Returned', 'Overdue'].map((tab) => (
        <button
          key={tab}
          onClick={() => setFilter(tab as any)}
          className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
            filter === tab 
              ? 'bg-surfaceHighlight text-text-primary shadow-sm' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Activity</h1>
        <p className="text-text-secondary mt-1">History of your equipment loans</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
         <Tabs />
         <div className="relative w-full sm:w-64">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
           <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search activity..."
             className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-text-secondary/30 transition-all"
           />
         </div>
      </div>

      <div className="space-y-4">
        {filteredLoans.map(loan => (
          <div key={loan.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
             <div className="w-12 h-12 bg-surfaceHighlight rounded-lg overflow-hidden shrink-0">
                <img src={loan.image} alt="" className="w-full h-full object-cover opacity-90" />
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-text-primary font-medium text-sm">{loan.equipmentName}</h3>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                   loan.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' :
                   loan.status === 'Overdue' ? 'bg-danger/10 text-danger border-danger/20' :
                   'bg-surfaceHighlight text-text-secondary border-border'
                 }`}>
                   {loan.status}
                 </span>
               </div>
               <div className="flex items-center gap-4 text-xs text-text-secondary">
                 <span className="flex items-center gap-1"><Calendar size={12} /> Borrowed: {new Date(loan.borrowDate).toLocaleDateString()}</span>
                 <span>•</span>
                 <span className={loan.status === 'Overdue' ? 'text-danger' : ''}>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};