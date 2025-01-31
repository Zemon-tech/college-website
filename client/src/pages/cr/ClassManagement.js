import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function ClassManagement() {
  const { user } = useAuth();
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      if (!user?.crDetails?.assignedClass) {
        setError('No class assigned');
        return;
      }

      // Fetch class details including students
      const response = await api.get(`/cr/class/${user.crDetails.assignedClass}`);
      setClassDetails(response.data);
      setStudents(response.data.students || []);
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Class Details Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Class Name</h3>
            <p className="mt-1 text-lg font-semibold">{classDetails?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Branch</h3>
            <p className="mt-1 text-lg font-semibold">{classDetails?.branch}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Section</h3>
            <p className="mt-1 text-lg font-semibold">{classDetails?.section}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Year</h3>
            <p className="mt-1 text-lg font-semibold">{classDetails?.year}</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Class Students</h2>
          <p className="mt-1 text-sm text-gray-500">
            Total Students: {students.length}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.studentDetails?.enrollmentNumber || student.enrollmentNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => window.location.href = `mailto:${student.email}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Send Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No students found in this class</p>
          </div>
        )}
      </div>
    </div>
  );
} 