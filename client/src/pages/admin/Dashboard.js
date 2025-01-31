import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
  });

  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    branch: '',
    year: '',
    cr: '',
    teachers: []
  });

  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    isGlobal: true,
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    enrollmentNumber: '',
    password: '',
    role: 'student',
    classId: ''
  });

  const [classStudents, setClassStudents] = useState([]);

  // Add state for edit mode
  const [editMode, setEditMode] = useState({
    type: null, // 'user', 'class', or null
    data: null
  });

  useEffect(() => {
    fetchUsers();
    fetchClasses();
    fetchUpdates();
    fetchAvailableStudents();
  }, []);

  // Fetch functions
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data?.message || error.message);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      // Transform the data to ensure CR is properly structured
      const transformedClasses = response.data.map(cls => ({
        ...cls,
        cr: cls.cr?._id || cls.cr // Handle both populated and unpopulated cases
      }));
      setClasses(transformedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error.response?.data?.message || error.message);
    }
  };

  const fetchUpdates = async () => {
    try {
      const response = await api.get('/admin/updates');
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error.response?.data?.message || error.message);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await api.get('/admin/users?role=student&unassigned=true');
      setAvailableStudents(response.data);
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };

  // Create functions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error.response?.data?.message || error.message);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      // Create the class
      const classResponse = await api.post('/admin/classes', newClass);
      const createdClass = classResponse.data;

      // If a CR is selected, update the CR's details
      if (newClass.cr) {
        await api.put(`/admin/users/${newClass.cr}`, {
          crDetails: {
            assignedClass: createdClass._id
          }
        });
      }

      setNewClass({
        name: '',
        section: '',
        branch: '',
        year: '',
        cr: '',
        teachers: []
      });
      fetchClasses();
      fetchUsers(); // Refresh users to update CR assignments
    } catch (error) {
      console.error('Error creating class:', error.response?.data?.message || error.message);
      alert('Error creating class: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/updates', newUpdate);
      setNewUpdate({
        title: '',
        content: '',
        isGlobal: true,
      });
      fetchUpdates();
    } catch (error) {
      console.error('Error creating update:', error.response?.data?.message || error.message);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    setNewClass(prev => ({
      ...prev,
      students: [...prev.students, { ...newStudent }]
    }));
    setNewStudent({
      name: '',
      email: '',
      enrollmentNumber: '',
      password: '',
      role: 'student',
      classId: ''
    });
  };

  const handleRemoveStudent = (index) => {
    setNewClass(prev => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index)
    }));
  };

  // Delete functions
  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error.response?.data?.message || error.message);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await api.delete(`/admin/classes/${classId}`);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error.response?.data?.message || error.message);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      await api.delete(`/admin/updates/${updateId}`);
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error.response?.data?.message || error.message);
    }
  };

  // Edit functions
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const { _id, ...userData } = editMode.data;
      await api.put(`/admin/users/${_id}`, userData);
      setEditMode({ type: null, data: null });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error.response?.data?.message || error.message);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const { _id, ...classData } = editMode.data;
      
      // Get the original class data to check for CR changes
      const originalClass = classes.find(c => c._id === _id);
      
      if (!originalClass) {
        throw new Error('Class not found');
      }

      // Update the class first
      await api.put(`/admin/classes/${_id}`, classData);

      // Handle CR changes separately
      if (originalClass.cr?._id !== classData.cr) {
        // Remove class from old CR if exists
        if (originalClass.cr?._id) {
          try {
            await api.put(`/admin/users/${originalClass.cr._id}`, {
              crDetails: { assignedClass: null }
            });
          } catch (err) {
            console.error('Error updating old CR:', err);
          }
        }
        
        // Assign class to new CR if exists
        if (classData.cr) {
          try {
            await api.put(`/admin/users/${classData.cr}`, {
              crDetails: { assignedClass: _id }
            });
          } catch (err) {
            console.error('Error updating new CR:', err);
          }
        }
      }

      setEditMode({ type: null, data: null });
      await fetchClasses();
      await fetchUsers();
      
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Error updating class: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchClassStudents = async (classId) => {
    try {
      const response = await api.get(`/admin/classes/${classId}/students`);
      // Transform the data if needed
      const transformedStudents = response.data.map(student => ({
        ...student,
        enrollmentNumber: student.enrollmentNumber || student.studentDetails?.enrollmentNumber
      }));
      setClassStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching class students:', error.response?.data?.message || error.message);
    }
  };

  const handleAddStudentToClass = async (classId, studentData) => {
    try {
      // Create new student with class assignment
      await api.post('/admin/users', {
        ...studentData,
        role: 'student',
        classId,
        studentDetails: {
          enrollmentNumber: studentData.enrollmentNumber,
          class: classId
        }
      });
      
      // Reset form
      setNewStudent({
        name: '',
        email: '',
        enrollmentNumber: '',
        password: '',
        role: 'student',
        classId: ''
      });
      
      // Refresh the students list for this class
      await fetchClassStudents(classId);
      await fetchUsers();

      // Show success message
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveStudentFromClass = async (classId, studentId) => {
    try {
      await api.delete(`/admin/classes/${classId}/students/${studentId}`);
      await fetchClassStudents(classId);
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  // Add this function to check if a CR is already assigned
  const isCRAssigned = (crId) => {
    return classes.some(cls => {
      // Check against both possible CR formats
      const classCrId = cls.cr?._id || cls.cr;
      return classCrId === crId;
    });
  };

  // Render functions
  const renderUserForm = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Create New User</h2>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="teacher">Teacher</option>
              <option value="cr">CR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );

  const renderClassEditForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Class</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleEditClass(editingClass);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editingClass.name}
              onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Students</label>
            <select
              multiple
              value={selectedStudents}
              onChange={(e) => setSelectedStudents(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {availableStudents.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.enrollmentNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setEditingClass(null);
                setSelectedStudents([]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderClassForm = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Create New Class</h2>
      <form onSubmit={handleCreateClass} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class Name</label>
            <input
              type="text"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <input
              type="text"
              value={newClass.section}
              onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <input
              type="text"
              value={newClass.branch}
              onChange={(e) => setNewClass({ ...newClass, branch: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={newClass.year}
              onChange={(e) => setNewClass({ ...newClass, year: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CR</label>
            <select
              value={newClass.cr}
              onChange={(e) => setNewClass({ ...newClass, cr: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select CR</option>
              {users
                .filter(user => user.role === 'cr' && (!isCRAssigned(user._id) || user._id === newClass.cr))
                .map(cr => (
                  <option key={cr._id} value={cr._id}>
                    {cr.name} {isCRAssigned(cr._id) && cr._id !== newClass.cr ? ' (Already Assigned)' : ''}
                  </option>
                ))
              }
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teachers</label>
            <select
              multiple
              value={newClass.teachers}
              onChange={(e) => setNewClass({
                ...newClass,
                teachers: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {users
                .filter(user => user.role === 'teacher')
                .map(teacher => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))
              }
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Class
          </button>
        </div>
      </form>
    </div>
  );

  const renderStudentManagementModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Manage Students - {selectedClass?.name}</h3>
          <button
            onClick={() => setShowStudentModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Add Student Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddStudentToClass(selectedClass._id, {
            ...newStudent,
            classId: selectedClass._id
          });
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enrollment Number</label>
            <input
              type="text"
              value={newStudent.enrollmentNumber}
              onChange={(e) => setNewStudent({ ...newStudent, enrollmentNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={newStudent.password}
              onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              minLength="8"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Student Account
            </button>
          </div>
        </form>

        {/* Students List */}
        <div className="mt-8">
          <h4 className="text-md font-medium mb-4">Current Class Students</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.enrollmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveStudentFromClass(selectedClass._id, student._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClassesList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">All Classes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td className="px-6 py-4 whitespace-nowrap">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.section}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.year}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => setEditMode({ type: 'class', data: cls })}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClass(cls);
                      setShowStudentModal(true);
                      fetchClassStudents(cls._id);
                    }}
                    className="text-green-600 hover:text-green-900"
                  >
                    Manage Students
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEditModal = () => {
    if (!editMode.type) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Edit {editMode.type === 'user' ? 'User' : 'Class'}
            </h3>
            <button
              onClick={() => setEditMode({ type: null, data: null })}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {editMode.type === 'user' ? (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editMode.data.name}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, name: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editMode.data.email}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, email: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editMode.data.role}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, role: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="teacher">Teacher</option>
                  <option value="cr">CR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditMode({ type: null, data: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEditClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editMode.data.name || ''}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, name: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <input
                  type="text"
                  value={editMode.data.section || ''}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, section: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  value={editMode.data.branch || ''}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, branch: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={editMode.data.year || ''}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, year: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CR</label>
                <select
                  value={editMode.data.cr || ''}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { ...editMode.data, cr: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select CR</option>
                  {users
                    .filter(user => 
                      user.role === 'cr' && 
                      (!isCRAssigned(user._id) || user._id === editMode.data.cr || 
                       (editMode.data.cr?._id && user._id === editMode.data.cr._id))
                    )
                    .map(cr => (
                      <option key={cr._id} value={cr._id}>
                        {cr.name} {cr._id === editMode.data.cr ? '(Current CR)' : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teachers</label>
                <select
                  multiple
                  value={editMode.data.teachers || []}
                  onChange={(e) => setEditMode({
                    ...editMode,
                    data: { 
                      ...editMode.data, 
                      teachers: Array.from(e.target.selectedOptions, option => option.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {users
                    .filter(user => user.role === 'teacher')
                    .map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditMode({ type: null, data: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderUsersList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">All Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  {user.role === 'student' && (
                    <div className="text-sm">
                      <p>Enrollment: {user.enrollmentNumber || user.studentDetails?.enrollmentNumber}</p>
                      {user.studentDetails?.class && (
                        <p>Class: {
                          typeof user.studentDetails.class === 'object' 
                            ? user.studentDetails.class.name 
                            : classes.find(c => c._id === user.studentDetails.class)?.name || 'Unknown'
                        }</p>
                      )}
                    </div>
                  )}
                  {user.role === 'cr' && (
                    <div className="text-sm">
                      {user.crDetails?.assignedClass && (
                        <p>Class: {
                          typeof user.crDetails.assignedClass === 'object'
                            ? user.crDetails.assignedClass.name
                            : classes.find(c => c._id === user.crDetails.assignedClass)?.name || 'Unknown'
                        }</p>
                      )}
                    </div>
                  )}
                  {user.role === 'teacher' && (
                    <div className="text-sm">
                      <p>Classes: {
                        classes
                          .filter(c => c.teachers.includes(user._id))
                          .map(c => c.name)
                          .join(', ') || 'None'
                      }</p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditMode({ type: 'user', data: user })}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['users', 'classes', 'updates'].map((tab) => (
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {renderUserForm()}
            {renderUsersList()}
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            {renderClassForm()}
            {renderClassesList()}
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* Create Update Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Create College-Wide Update</h2>
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
                  Post Update
                </button>
              </form>
            </div>

            {/* Updates List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">All Updates</h2>
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update._id} className="border-b pb-4">
                    <h3 className="font-medium">{update.title}</h3>
                    <p className="text-gray-600 mt-1">{update.content}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(update.timestamp).toLocaleDateString()}
                      </span>
                      <div>
                        <button
                          onClick={() => {/* Handle edit */}}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUpdate(update._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {editMode.type && renderEditModal()}
      {showStudentModal && renderStudentManagementModal()}
    </DashboardLayout>
  );
} 