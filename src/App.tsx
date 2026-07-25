import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Contact from './pages/Contact';
import AdminLogin from './components/AdminLogin';

const AdminDashboard: React.FC = () => {
  return <div>Admin Dashboard</div>; // Replace with your actual component logic
};

function App() {
  return (
    <Routes>
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<AdminDashboard />} /> // Updated to use AdminDashboard as a JSX component
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
}

export default App;