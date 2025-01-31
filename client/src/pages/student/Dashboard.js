import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      if (!user?.studentDetails?.class) {
        setError('No class assigned');
        return;
      }
      const response = await api.get(`/student/schedule/${user.studentDetails.class}`);
      setSchedule(response.data);
    } catch (err) {
      console.error('Error fetching schedule:', err.response?.data?.message || err.message);
      setError('Failed to fetch schedule');
    }
  }, [user]);

  const fetchUpdates = useCallback(async () => {
    try {
      const response = await api.get('/student/updates');
      setUpdates(response.data);
    } catch (err) {
      console.error('Error fetching updates:', err.response?.data?.message || err.message);
      setError('Failed to fetch updates');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSchedule(),
          fetchUpdates()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchSchedule, fetchUpdates]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Schedule Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Class Schedule</h2>
          {schedule ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((day, dayIndex) => (
                    day.periods.map((period, periodIndex) => (
                      <tr key={`${dayIndex}-${periodIndex}`}>
                        {periodIndex === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap" rowSpan={day.periods.length}>
                            {day.day}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">{period.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{period.teacher?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{period.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{period.roomNo}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">No schedule available</div>
          )}
        </div>

        {/* Updates Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Updates</h2>
          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map((update) => (
                <div key={update._id} className="border-b pb-4">
                  <h3 className="font-medium">{update.title}</h3>
                  <p className="text-gray-600 mt-1">{update.content}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(update.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No updates available</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 