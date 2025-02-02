import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminClasses from './pages/admin/Classes';
import AdminUpdates from './pages/admin/Updates';
import CRDashboard from './pages/cr/Dashboard';
import CRUpdates from './pages/cr/Updates';
import CRResources from './pages/cr/Resources';
import CRFaculty from './pages/cr/Faculty';
import StudentDashboard from './pages/student/Dashboard';
import StudentSchedule from './pages/student/Schedule';
import StudentUpdates from './pages/student/Updates';
import StudentFaculty from './pages/student/Faculty';
import CRTimetable from './pages/cr/Timetable';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/classes" element={<PrivateRoute role="admin"><AdminClasses /></PrivateRoute>} />
          <Route path="/admin/updates" element={<PrivateRoute role="admin"><AdminUpdates /></PrivateRoute>} />
          
          {/* CR Routes */}
          <Route path="/cr" element={<PrivateRoute role="cr"><CRDashboard /></PrivateRoute>} />
          <Route path="/cr/updates" element={<PrivateRoute role="cr"><CRUpdates /></PrivateRoute>} />
          <Route path="/cr/resources" element={<PrivateRoute role="cr"><CRResources /></PrivateRoute>} />
          <Route path="/cr/faculty" element={<PrivateRoute role="cr"><CRFaculty /></PrivateRoute>} />
          <Route path="/cr/timetable" element={<PrivateRoute role="cr"><CRTimetable /></PrivateRoute>} />
          
          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/schedule" element={<PrivateRoute role="student"><StudentSchedule /></PrivateRoute>} />
          <Route path="/student/updates" element={<PrivateRoute role="student"><StudentUpdates /></PrivateRoute>} />
          <Route path="/student/faculty" element={<PrivateRoute role="student"><StudentFaculty /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 