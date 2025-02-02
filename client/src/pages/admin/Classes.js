import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import CustomDropdownWithAdd from '../../components/CustomDropdownWithAdd';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    branch: '',
    course: '',
    section: '',
    year: '',
    classIncharge: '',
    teachers: []
  });
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'students', 'schedule'
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedCR, setSelectedCR] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchUsers();
    fetchUnassignedCRs();
    fetchBranches();
    fetchCourses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/unassigned-teachers');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnassignedCRs = async () => {
    try {
      const response = await api.get('/admin/users/unassigned-crs');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching unassigned CRs:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/admin/branches');
      setBranches(response.data.map(branch => branch.name));
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data.map(course => course.name));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddBranch = async (newBranch) => {
    try {
      await api.post('/admin/branches', { name: newBranch });
      fetchBranches();
    } catch (error) {
      console.error('Error adding branch:', error);
    }
  };

  const handleAddCourse = async (newCourse) => {
    try {
      await api.post('/admin/courses', { name: newCourse });
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const className = `${newClass.branch}${newClass.course}${newClass.section}-${newClass.year}yr`;
    try {
      await api.post('/admin/classes', {
        ...newClass,
        name: className,
        teachers: selectedTeachers,
        cr: selectedCR
      });
      fetchClasses();
      setNewClass({
        name: '',
        branch: '',
        course: '',
        section: '',
        year: '',
        classIncharge: '',
        teachers: []
      });
      setSelectedTeachers([]);
      setSelectedCR('');
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await api.delete(`/admin/classes/${classId}`);
      fetchClasses();
      setSelectedClass(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleClassSelect = async (classData) => {
    setSelectedClass(classData);
    setActiveTab('students');
    fetchClassStudents(classData._id);
    fetchClassSchedule(classData._id);
  };

  const fetchClassStudents = async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/classes/${classId}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSchedule = async (classId) => {
    try {
      const response = await api.get(`/admin/classes/${classId}/schedule`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleUpdateSchedule = async (updatedSchedule) => {
    try {
      await api.put(`/admin/classes/${selectedClass._id}/schedule`, updatedSchedule);
      fetchClassSchedule(selectedClass._id);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const renderClassForm = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Create New Class</h2>
      <form onSubmit={handleCreateClass} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <CustomDropdownWithAdd
              options={branches}
              value={newClass.branch}
              onChange={(value) => setNewClass({ ...newClass, branch: value })}
              onAdd={handleAddBranch}
              placeholder="Select Branch"
              label="branch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <CustomDropdownWithAdd
              options={courses}
              value={newClass.course}
              onChange={(value) => setNewClass({ ...newClass, course: value })}
              onAdd={handleAddCourse}
              placeholder="Select Course"
              label="course"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <input
              type="text"
              value={newClass.section}
              onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700">Class Incharge</label>
            <select
              value={newClass.classIncharge}
              onChange={(e) => setNewClass({ ...newClass, classIncharge: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Class Incharge</option>
              {users.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Teachers</label>
            <select
              multiple
              value={selectedTeachers}
              onChange={(e) => setSelectedTeachers(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {users.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class CR</label>
            <select
              value={selectedCR}
              onChange={(e) => setSelectedCR(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select CR</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Class
        </button>
      </form>
    </div>
  );

  const renderClassesList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Classes List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleClassSelect(cls)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {cls.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.course}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.section}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cls.year}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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

  const renderClassDetails = () => {
    if (!selectedClass) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{selectedClass.name} Details</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-2 rounded-md ${
                  activeTab === 'students' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-2 rounded-md ${
                  activeTab === 'schedule' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Schedule
              </button>
            </div>
          </div>

          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'schedule' && (
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
                  {schedule.map((slot, index) => (
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
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {selectedClass ? (
          <>
            <button
              onClick={() => {
                setSelectedClass(null);
                setActiveTab('list');
              }}
              className="mb-4 text-indigo-600 hover:text-indigo-900"
            >
              ← Back to Classes
            </button>
            {renderClassDetails()}
          </>
        ) : (
          <>
            {renderClassForm()}
            {renderClassesList()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 