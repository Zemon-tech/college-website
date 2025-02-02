import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Timetable() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        if (!user?.crDetails?.assignedClass) {
          setError('No assigned class found');
          return;
        }
        const response = await api.get(`/cr/class/${user.crDetails.assignedClass}/schedule`);
        setSchedule(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load schedule');
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div>Loading schedule...</div>
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
        <h2 className="text-lg font-semibold mb-6">Class Schedule</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuesday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wednesday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thursday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Friday</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule?.map((slot, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.monday}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.tuesday}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.wednesday}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.thursday}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{slot.friday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 