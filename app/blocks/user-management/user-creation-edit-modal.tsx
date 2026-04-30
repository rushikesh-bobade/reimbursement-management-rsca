import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import classnames from 'classnames';
import style from './user-creation-edit-modal.module.css';
import type { User, UserRole } from '~/data/types';

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
}

export interface UserCreationEditModalProps {
  isOpen: boolean;
  editingUser?: User | null;
  existingUsers: User[];
  onClose: () => void;
  onSave: (data: UserFormData) => void;
}

export function UserCreationEditModal({ isOpen, editingUser, existingUsers, onClose, onSave }: UserCreationEditModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<UserFormData>({
    mode: 'onChange',
    defaultValues: { name: '', email: '', role: 'EMPLOYEE', managerId: '' },
  });

  const role = watch('role');
  const needsManager = role === 'EMPLOYEE' || role === 'MANAGER';
  const managers = existingUsers.filter((u) => u.id !== editingUser?.id && (u.role === 'MANAGER' || u.role === 'ADMIN'));

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        managerId: editingUser.managerId ?? '',
      });
    } else {
      reset({ name: '', email: '', role: 'EMPLOYEE', managerId: '' });
    }
  }, [editingUser, isOpen, reset]);

  if (!isOpen) return null;

  const existingEmails = existingUsers
    .filter((u) => u.id !== editingUser?.id)
    .map((u) => u.email.toLowerCase());

  const onSubmit = (data: UserFormData) => {
    onSave(data);
    reset();
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h2 className={style.title}>{editingUser ? 'Edit User' : 'Create New User'}</h2>
          <button className={classnames('btn', style.closeBtn)} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={style.body}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                placeholder="Jane Smith"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 chars' } })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="jane@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' },
                  validate: (v) => !existingEmails.includes(v.toLowerCase()) || 'Email already exists',
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-input" {...register('role', { required: 'Role is required' })}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>

            {needsManager && (
              <div className="form-group">
                <label className="form-label">Assigned Manager</label>
                <select className="form-input" {...register('managerId')}>
                  <option value="">No manager assigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={style.footer}>
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={!isValid}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
