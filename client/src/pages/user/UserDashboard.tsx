import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Calendar, Clock, Activity, Briefcase } from 'lucide-react';

interface AssignedProject {
  allocationId: string;
  allocationPercentage: number;
  allocationStartDate: string;
  allocationEndDate: string;
  project: {
    _id: string;
    projectName: string;
    projectCode: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
  }
}

const UserDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/user/projects');
        setAssignments(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);

  if (loading) return <div>Loading assigned projects...</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-gray-900">My Assigned Projects</h2>
         <p className="text-gray-500 mt-1">View the projects you have been allocated to.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.allocationId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="p-6 border-b border-gray-50 flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-bold text-gray-900">{assignment.project.projectName}</h3>
                 <p className="text-sm text-indigo-600 font-medium">Code: {assignment.project.projectCode}</p>
               </div>
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700">
                  <Activity size={16} className="mr-1.5" /> {assignment.allocationPercentage}% Allocated
               </span>
            </div>

            <div className="p-6 bg-gray-50/50 space-y-4">
               {assignment.project.description && (
                  <p className="text-sm text-gray-600 mb-4">{assignment.project.description}</p>
               )}
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-start space-x-3">
                     <Briefcase className="text-gray-400 mt-0.5" size={18} />
                     <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project Timeline</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(assignment.project.startDate).toLocaleDateString()} - {new Date(assignment.project.endDate).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 flex items-start space-x-3">
                     <Clock className="text-indigo-400 mt-0.5" size={18} />
                     <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Your Allocation</p>
                        <p className="text-sm text-indigo-900 mt-1">
                          {new Date(assignment.allocationStartDate).toLocaleDateString()} - {new Date(assignment.allocationEndDate).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
           <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">You are not currently assigned to any active projects.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
