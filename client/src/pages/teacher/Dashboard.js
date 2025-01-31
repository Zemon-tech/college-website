import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [resources, setResources] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'note',
    file: null,
    link: '',
  });

  const fetchUpdates = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/updates/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  }, [selectedClass]);

  const fetchResources = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/resources/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchUpdates();
      fetchResources();
    }
  }, [selectedClass, fetchUpdates, fetchResources]);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  const fetchAssignedClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAssignedClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teacher/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newUpdate,
          targetClass: selectedClass
        }),
      });
      
      if (response.ok) {
        setNewUpdate({ title: '', content: '' });
        fetchUpdates();
      }
    } catch (error) {
      console.error('Error creating update:', error);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newResource).forEach(key => {
      formData.append(key, newResource[key]);
    });
    formData.append('targetClass', selectedClass);

    try {
      const response = await fetch('/api/teacher/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      if (response.ok) {
        setNewResource({
          title: '',
          description: '',
          type: 'note',
          file: null,
          link: '',
        });
        fetchResources();
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Class Selection */}
        <div className="bg-white shadow rounded-lg p-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <>
            {/* Create Update Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Create Update</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
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
                  Post Update
                </button>
              </form>
            </div>

            {/* Upload Resource Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Resource</h2>
              <form onSubmit={handleResourceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="note">Note</option>
                    <option value="assignment">Assignment</option>
                    <option value="link">Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {newResource.type === 'link' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link</label>
                    <input
                      type="url"
                      value={newResource.link}
                      onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File</label>
                    <input
                      type="file"
                      onChange={(e) => setNewResource({ ...newResource, file: e.target.files[0] })}
                      className="mt-1 block w-full"
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upload Resource
                </button>
              </form>
            </div>

            {/* Updates and Resources Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Updates List */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Your Updates</h2>
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update._id} className="border-b pb-4">
                      <h3 className="font-medium">{update.title}</h3>
                      <p className="text-gray-600 mt-1">{update.content}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(update.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources List */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Your Resources</h2>
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource._id} className="border-b pb-4">
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-gray-600 mt-1">{resource.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                        {resource.link ? (
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Open Link
                          </a>
                        ) : (
                          <a
                            href={resource.fileUrl}
                            download
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 