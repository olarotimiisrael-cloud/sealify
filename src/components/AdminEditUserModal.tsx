import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'shadcn/ui';

interface AdminEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming you have a function to create a new user
      await createUser(username, email, password);
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <Modal.Content>
        <Modal.Header>Add New User</Modal.Header>
        <Form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="form-control w-full max-w-sm">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-control w-full max-w-sm">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-control w-full max-w-sm">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Modal.Footer>
            <Button type="submit" variant="primary">
              Add User
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default AdminEditUserModal;