import { useState } from 'react';
import styles from './approval-rules.module.css';
import { RulesPageHeader } from '../blocks/approval-rules/rules-page-header';
import { ApprovalRulesList } from '../blocks/approval-rules/approval-rules-list';
import { RuleConfigurationForm } from '../blocks/approval-rules/rule-configuration-form';
import { useStore } from '~/hooks/use-store';
import type { ApprovalRule } from '~/data/types';
import type { RuleFormData } from '~/blocks/approval-rules/rule-configuration-form';
import { ProtectedRoute } from '~/components/protected-route/protected-route';

function ApprovalRulesContent() {
  const store = useStore();
  const rules = store.getApprovalRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<ApprovalRule | null>(null);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleSave = (data: RuleFormData) => {
    if (editingRule) {
      store.updateApprovalRule(editingRule.id, data);
    } else {
      store.addApprovalRule(data);
    }
    setModalOpen(false);
    setEditingRule(null);
  };

  const confirmDelete = () => {
    if (deletingRule) {
      store.deleteApprovalRule(deletingRule.id);
      setDeletingRule(null);
    }
  };

  return (
    <div className={styles.page}>
      <RulesPageHeader onCreateRule={handleOpenCreate} />
      <ApprovalRulesList rules={rules} onEdit={handleEdit} onDelete={(rule) => setDeletingRule(rule)} />

      <RuleConfigurationForm
        isOpen={modalOpen}
        editingRule={editingRule}
        existingRules={rules}
        onClose={() => { setModalOpen(false); setEditingRule(null); }}
        onSave={handleSave}
      />

      {deletingRule && (
        <div className={styles.confirmOverlay} onClick={() => setDeletingRule(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.confirmTitle}>Delete Rule</h2>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deletingRule.name}</strong>? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className="btn btn--secondary" onClick={() => setDeletingRule(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalRules() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <ApprovalRulesContent />
    </ProtectedRoute>
  );
}
