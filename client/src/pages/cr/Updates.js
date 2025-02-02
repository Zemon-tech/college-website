import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Updates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/cr/updates');
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cr/updates', newUpdate);
      fetchUpdates();
      setNewUpdate({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating update:', error);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await api.delete(`/cr/updates/${updateId}`);
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Create Update Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Update</h2>
          <form onSubmit={handleCreateUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Update
            </button>
          </form>
        </div>

        {/* Updates List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Updates List</h2>
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update._id} className="border-b pb-4">
                <div className="flex justify-between">
                  <h3 className="font-medium">{update.title}</h3>
                  {update.author?._id === user._id && (
                    <button
                      onClick={() => handleDeleteUpdate(update._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
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
      </div>
    </DashboardLayout>
  );
} 