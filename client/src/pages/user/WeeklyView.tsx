import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface WeeklyAlloc {
  projectId: string;
  projectName: string;
  projectCode: string;
  weeklyAllocation: {
    "Week 1": string;
    "Week 2": string;
    "Week 3": string;
    "Week 4": string;
    startDate: string;
    endDate: string;
  };
}

const WeeklyView: React.FC = () => {
  const [weeks, setWeeks] = useState<WeeklyAlloc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await api.get('/user/allocations/weekly');
        setWeeks(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeekly();
  }, []);

  if (loading) return <div>Loading weekly view...</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-gray-900">Weekly Allocation Outlook</h2>
         <p className="text-gray-500 mt-1">A projected 4-week lookahead based on your active project assigned dates.</p>
      </div>

      <div className="space-y-6">
        {weeks.map((item) => (
           <div key={item.projectId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <CalendarDays size={20} />
                     </div>
                     <div>
                         <h3 className="font-bold text-gray-900">{item.projectName}</h3>
                         <p className="text-xs text-indigo-600 font-medium">{item.projectCode}</p>
                     </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                     <p>Valid From: <span className="font-semibold text-gray-700">{new Date(item.weeklyAllocation.startDate).toLocaleDateString()}</span></p>
                     <p>Valid Until: <span className="font-semibold text-gray-700">{new Date(item.weeklyAllocation.endDate).toLocaleDateString()}</span></p>
                  </div>
               </div>

               <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((weekStr) => (
                    <div key={weekStr} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center hover:bg-indigo-50 hover:-translate-y-1 hover:shadow-sm transition-all duration-200">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{weekStr}</p>
                        <div className="flex items-end justify-center">
                            <span className="text-3xl font-extrabold text-indigo-600">
                               {/* @ts-ignore */}
                               {item.weeklyAllocation[weekStr]?.replace('%', '') || '0'}
                            </span>
                            <span className="text-sm text-indigo-400 font-bold mb-1 ml-1">%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                            <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
                                /* @ts-ignore */
                                style={{ width: item.weeklyAllocation[weekStr] || '0%' }}
                            ></div>
                        </div>
                    </div>
                  ))}
               </div>
           </div>
        ))}
        {weeks.length === 0 && (
           <div className="text-center py-12 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No active weekly allocations found.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyView;
