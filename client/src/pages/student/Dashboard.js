import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Hello, {user.name}
        </h1>
        <p className="mt-2 text-gray-600">Welcome to your student dashboard.</p>
      </div>
    </DashboardLayout>
  );
} 