import { Search } from 'lucide-react';
import classnames from 'classnames';
import style from './filters-and-search.module.css';
import { EXPENSE_CATEGORIES } from '~/data/mock-data';

export interface FiltersState {
  search: string;
  category: string;
  status: string;
}

export interface FiltersAndSearchProps {
  className?: string;
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

export function FiltersAndSearch({ className, filters, onFiltersChange }: FiltersAndSearchProps) {
  const update = (key: keyof FiltersState, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const clear = () => onFiltersChange({ search: '', category: '', status: '' });

  return (
    <div className={classnames(style.filters, className)}>
      <div className={style.searchWrapper}>
        <Search size={15} className={style.searchIcon} />
        <input
          type="text"
          className={classnames('form-input', style.searchInput)}
          placeholder="Search by employee or description..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <select
        className={classnames('form-input', style.select)}
        value={filters.category}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">All Categories</option>
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={classnames('form-input', style.select)}
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {(filters.search || filters.category || filters.status) && (
        <button className={style.clearBtn} onClick={clear}>Clear filters</button>
      )}
    </div>
  );
}
