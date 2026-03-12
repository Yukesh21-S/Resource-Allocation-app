import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Users, AlertTriangle, TrendingUp, Briefcase } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    utilization: [],
    available: [],
    overallocated: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [utilRes, availRes, overRes, projRes] = await Promise.all([
          api.get('/admin/reports/utilization'),
          api.get('/admin/reports/available'),
          api.get('/admin/reports/overallocated'),
          api.get('/admin/reports/projects-summary')
        ]);
        
        setStats({
          utilization: utilRes.data,
          available: availRes.data,
          overallocated: overRes.data,
          projects: projRes.data
        });
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{stats.projects.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Staff</p>
            <p className="text-2xl font-bold text-gray-900">{stats.utilization.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Bench (Available)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.available.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overallocated</p>
            <p className="text-2xl font-bold text-red-600">{stats.overallocated.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Available Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Available Resources (Bench)</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {stats.available.length === 0 ? (
               <div className="p-6 text-gray-500 text-center text-sm">No available resources found.</div>
            ) : (
                stats.available.map((user: any) => (
                <div key={user._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.employeeId} - {user.designation}</p>
                    </div>
                    <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {100 - user.totalAllocationPercentage}% Free
                    </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Overallocated Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Overallocated Alerts</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{stats.overallocated.length} Action Needed</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {stats.overallocated.length === 0 ? (
               <div className="p-6 text-gray-500 text-center text-sm">No overallocated resources.</div>
            ) : (
                stats.overallocated.map((user: any) => (
                <div key={user._id} className="p-4 flex items-center justify-between hover:bg-red-50 transition-colors">
                    <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.employeeId}</p>
                    </div>
                    <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {user.totalAllocationPercentage}% Used
                    </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
