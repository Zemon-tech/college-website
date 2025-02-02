import React from 'react';

export default function FacultyList({ classData }) {
  // Add debug logging
  console.log('FacultyList received classData:', classData);
  console.log('Class incharge:', classData?.classIncharge);

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-6">Faculty Members</h2>
      
      {/* Class In-charge Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-700 mb-4">Class In-charge</h3>
        {classData?.classIncharge ? (
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{classData.classIncharge.name}</p>
              <p className="text-sm text-gray-500">{classData.classIncharge.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No class in-charge assigned</p>
        )}
      </div>

      {/* Teachers Section */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-4">Subject Teachers</h3>
        {classData?.teachers && classData.teachers.length > 0 ? (
          <div className="grid gap-4">
            {classData.teachers.map((teacher) => (
              <div key={teacher._id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No teachers assigned</p>
        )}
      </div>
    </div>
  );
} 