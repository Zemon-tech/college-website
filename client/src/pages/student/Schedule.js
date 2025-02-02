import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function Schedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/student/schedule');
      setSchedule(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Failed to load schedule');
      setLoading(false);
    }
  };

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