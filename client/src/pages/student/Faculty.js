import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FacultyList from '../../components/FacultyList';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Faculty() {
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!user?.studentDetails?.class) {
          setError('No class information found');
          return;
        }
        const response = await api.get(`/student/class/${user.studentDetails.class}`);
        setClassData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching class data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div>Loading faculty information...</div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="text-red-600">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <FacultyList classData={classData} />
      </div>
    </DashboardLayout>
  );
} 