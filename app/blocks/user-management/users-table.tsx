import { useState } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import classnames from 'classnames';
import style from './users-table.module.css';
import type { User } from '~/data/types';

export interface UsersTableProps {
  className?: string;
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

type SortKey = 'name' | 'email' | 'role';
const PAGE_SIZE = 10;

function RoleBadge({ role }: { role: string }) {
  const cls = {
    ADMIN: style.roleAdmin,
    MANAGER: style.roleManager,
    EMPLOYEE: style.roleEmployee,
  }[role] ?? style.roleEmployee;
  return <span className={classnames(style.roleBadge, cls)}>{role}</span>;
}

export function UsersTable({ className, users, onEdit, onDelete }: UsersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const sorted = [...users].sort((a, b) => {
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={style.sortIcon}>
      {sortKey === col
        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        : <ChevronDown size={12} opacity={0.3} />}
    </span>
  );

  return (
    <div className={classnames(style.tableWrapper, className)}>
      {paginated.length === 0 ? (
        <p className={style.empty}>No users found.</p>
      ) : (
        <table className={style.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
              <th onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
              <th onClick={() => handleSort('role')}>Role <SortIcon col="role" /></th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><RoleBadge role={user.role} /></td>
                <td>{user.managerName ?? <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                <td>
                  <div className={style.actionCell}>
                    <button className="btn btn--secondary btn--sm" onClick={() => onEdit(user)} title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn--danger btn--sm" onClick={() => onDelete(user)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
        <div className={style.pagination}>
          <span>Page {page} of {totalPages} &bull; {users.length} total</span>
          <div className={style.paginationBtns}>
            <button className="btn btn--secondary btn--sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="btn btn--secondary btn--sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
