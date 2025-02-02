import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function CRDashboard() {
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!user?.crDetails?.assignedClass) {
          setError('No assigned class found');
          return;
        }
        const response = await api.get(`/cr/class/${user.crDetails.assignedClass}`);
        setClassData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching class data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [user]);

  const renderClassInfo = () => {
    if (loading) return <div>Loading class information...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!classData) return <div>No class information available</div>;

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Class Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Class: {classData.name}</p>
            <p className="text-gray-600">Branch: {classData.branch}</p>
            <p className="text-gray-600">Year: {classData.year}</p>
          </div>

          {/* Students List */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">Students</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classData.students?.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.enrollmentNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Hello, {user.name}
          </h1>
          <p className="mt-2 text-gray-600">Welcome to your CR dashboard.</p>
        </div>

        {/* Class Info Section */}
        {renderClassInfo()}
      </div>
    </DashboardLayout>
  );
} 