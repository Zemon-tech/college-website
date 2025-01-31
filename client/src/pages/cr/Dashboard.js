import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function CRDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timetable');
  const [classData, setClassData] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClassData = useCallback(async () => {
    try {
      if (!user?.crDetails?.assignedClass) {
        setError('No assigned class found');
        return;
      }
      const response = await api.get(`/cr/class/${user.crDetails.assignedClass}`);
      setClassData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching class data');
    }
  }, [user]);

  const fetchUpdates = useCallback(async () => {
    try {
      const response = await api.get('/cr/updates');
      setUpdates(response.data);
    } catch (err) {
      console.error('Error fetching updates:', err.response?.data?.message || err.message);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const response = await api.get('/cr/resources');
      setResources(response.data);
    } catch (err) {
      console.error('Error fetching resources:', err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClassData(),
          fetchUpdates(),
          fetchResources()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchClassData, fetchUpdates, fetchResources]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cr/updates', {
        ...newUpdate,
        targetClass: user.crDetails.assignedClass
      });
      
      setNewUpdate({ title: '', content: '' });
      fetchUpdates();
    } catch (err) {
      console.error('Error creating update:', err.response?.data?.message || err.message);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newResource).forEach(key => {
      formData.append(key, newResource[key]);
    });
    formData.append('targetClass', user.crDetails.assignedClass);

    try {
      await api.post('/cr/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setNewResource({
        title: '',
        description: '',
        type: 'note',
        file: null,
        link: '',
      });
      fetchResources();
    } catch (err) {
      console.error('Error uploading resource:', err.response?.data?.message || err.message);
    }
  };

  const renderClassInfo = () => {
    if (!classData) return null;

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Assigned Class</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Class Name</label>
            <p className="mt-1">{classData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Section</label>
            <p className="mt-1">{classData.section}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Branch</label>
            <p className="mt-1">{classData.branch}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Year</label>
            <p className="mt-1">{classData.year}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
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
    );
  };

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

  if (!classData) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="text-yellow-700">No class data available</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {renderClassInfo()}
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['timetable', 'updates', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'timetable' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Class Timetable</h2>
            {classData?.schedule && (
              <div className="space-y-4">
                {classData.schedule.map((day) => (
                  <div key={day.day} className="border-b pb-4">
                    <h3 className="font-medium mb-2 capitalize">{day.day}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {day.periods.map((period, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{period.subject}</span>
                          <span>{period.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
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
        )}
      </div>
    </DashboardLayout>
  );
} 