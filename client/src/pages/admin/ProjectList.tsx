import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, UserPlus, Calendar as CalendarIcon, ServerCrash, CheckCircle2 } from 'lucide-react';

// Types
interface Project {
  _id: string;
  projectName: string;
  projectCode: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface UserDropdownOption {
  _id: string;
  username: string;
  employeeId: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [usersList, setUsersList] = useState<UserDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allocateModalData, setAllocateModalData] = useState<Project | null>(null);

  // Form States
  const [newProject, setNewProject] = useState({ projectName: '', projectCode: '', startDate: '', endDate: '' });
  const [allocation, setAllocation] = useState({ userId: '', allocationPercentage: '', startDate: '', endDate: '' });
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/admin/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
        const res = await api.get('/admin/reports/utilization');
        setUsersList(res.data);
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post('/admin/projects', newProject);
      setShowCreateModal(false);
      setNewProject({ projectName: '', projectCode: '', startDate: '', endDate: '' });
      fetchProjects();
      setActionSuccess('Project created successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAllocateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.post(`/admin/projects/${allocateModalData?._id}/allocate`, {
        userId: allocation.userId, // this should perfectly hit the User model's employeeId based on our backend logic
        allocationPercentage: Number(allocation.allocationPercentage),
        startDate: allocation.startDate,
        endDate: allocation.endDate
      });
      setAllocateModalData(null);
      setAllocation({ userId: '', allocationPercentage: '', startDate: '', endDate: '' });
      setActionSuccess('Resource allocated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
       // Our backend returns an array of errors if allocation fails due to rules
       const errResponse = err.response?.data;
       if (errResponse?.errors?.length > 0) {
           setActionError(errResponse.errors[0].message);
       } else {
           setActionError(errResponse?.message || 'Failed to allocate resource');
       }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Portfolio</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={18} className="mr-2" />
          New Project
        </button>
      </div>

      {actionSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <CheckCircle2 size={18} className="mr-2" />
            {actionSuccess}
          </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">{proj.projectName}</h3>
                     <p className="text-xs text-indigo-600 font-semibold">{proj.projectCode}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${proj.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {proj.status}
                  </span>
               </div>
               
               <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon size={14} className="mr-2 text-gray-400" />
                    <span>{new Date(proj.startDate).toLocaleDateString()} - {new Date(proj.endDate).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
               <button
                 onClick={() => setAllocateModalData(proj)}
                 className="w-full flex justify-center items-center py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
               >
                 <UserPlus size={16} className="mr-2" />
                 Allocate Resource
               </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
           <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300 flex items-center justify-center flex-col">
              <ServerCrash size={48} className="text-gray-200 mb-4" />
              <p>No projects created yet.</p>
           </div>
        )}
      </div>

      {/* --- Modals for Create & Allocate --- */}
      
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <h3 className="text-xl font-bold mb-4">Create New Project</h3>
              {actionError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{actionError}</div>}
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input type="text" required value={newProject.projectName} onChange={(e) => setNewProject({...newProject, projectName: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Project Code <span className="text-xs text-gray-400">(Unique)</span></label>
                    <input type="text" required value={newProject.projectCode} onChange={(e) => setNewProject({...newProject, projectCode: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" required value={newProject.startDate} onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" required value={newProject.endDate} onChange={(e) => setNewProject({...newProject, endDate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Allocate Modal */}
      {allocateModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <h3 className="text-xl font-bold mb-1">Allocate Resource</h3>
              <p className="text-sm text-gray-500 mb-4 border-b border-gray-100 pb-2">to <span className="font-semibold text-indigo-600">{allocateModalData.projectName}</span></p>
              
              {actionError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{actionError}</div>}
              
              <form onSubmit={handleAllocateResource} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Assign User</label>
                    <select
                        required
                        value={allocation.userId}
                        onChange={(e) => setAllocation({...allocation, userId: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="" disabled>Select a user to assign...</option>
                        {usersList.map(user => (
                            <option key={user.employeeId} value={user.employeeId}>
                                {user.username} ({user.employeeId}) 
                            </option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Allocation Percentage</label>
                    <input type="number" required min="1" max="100" value={allocation.allocationPercentage} onChange={(e) => setAllocation({...allocation, allocationPercentage: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" required value={allocation.startDate} onChange={(e) => setAllocation({...allocation, startDate: e.target.value})} min={new Date(allocateModalData.startDate).toISOString().split('T')[0]} max={new Date(allocateModalData.endDate).toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" required value={allocation.endDate} onChange={(e) => setAllocation({...allocation, endDate: e.target.value})} min={new Date(allocateModalData.startDate).toISOString().split('T')[0]} max={new Date(allocateModalData.endDate).toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={() => setAllocateModalData(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Assign User</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default ProjectList;
