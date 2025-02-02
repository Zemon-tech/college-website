import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/student/updates');
      setUpdates(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError('Failed to load updates');
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div>Loading updates...</div>
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
        <h2 className="text-lg font-semibold mb-4">Class Updates</h2>
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update._id} className="border-b pb-4">
              <h3 className="font-medium">{update.title}</h3>
              <p className="text-gray-600 mt-1">{update.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                <span>By {update.author?.name || 'Unknown'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(update.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 