import React from 'react';
import { Button, Card, Table } from 'shadcn/ui';
import AdminEditUserModal from '../components/AdminEditUserModal';

const AdminDashboard: React.FC = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <Button onClick={() => setIsAddUserModalOpen(true)}>Add User</Button>
      <AdminEditUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;