import { useState } from 'react';
import styles from './user-management.module.css';
import { UsersPageHeader } from '../blocks/user-management/users-page-header';
import { UsersTable } from '../blocks/user-management/users-table';
import { UserCreationEditModal } from '../blocks/user-management/user-creation-edit-modal';
import { useStore } from '~/hooks/use-store';
import type { User } from '~/data/types';
import type { UserFormData } from '~/blocks/user-management/user-creation-edit-modal';
import { ProtectedRoute } from '~/components/protected-route/protected-route';

function UserManagementContent() {
  const store = useStore();
  const users = store.getUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editingUser) {
      store.updateUser(editingUser.id, data);
    } else {
      store.addUser(data);
    }
    setModalOpen(false);
    setEditingUser(null);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      store.deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  return (
    <div className={styles.page}>
      <UsersPageHeader onCreateUser={handleOpenCreate} />
      <UsersTable users={users} onEdit={handleEdit} onDelete={(u) => setDeletingUser(u)} />

      <UserCreationEditModal
        isOpen={modalOpen}
        editingUser={editingUser}
        existingUsers={users}
        onClose={() => { setModalOpen(false); setEditingUser(null); }}
        onSave={handleSave}
      />

      {deletingUser && (
        <div className={styles.confirmOverlay} onClick={() => setDeletingUser(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.confirmTitle}>Delete User</h2>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className="btn btn--secondary" onClick={() => setDeletingUser(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
