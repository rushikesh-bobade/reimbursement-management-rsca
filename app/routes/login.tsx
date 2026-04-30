import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DollarSign, Eye, EyeOff, LogIn } from 'lucide-react';
import { authenticate, DEMO_CREDENTIALS } from '~/data/auth';
import { useAuthContext } from '~/contexts/auth-context';
import { COMPANY_NAME } from '~/data/mock-data';
import styles from './login.module.css';

export default function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate a short async delay for realism
    await new Promise((r) => setTimeout(r, 400));
    const user = authenticate(email, password);
    setLoading(false);
    if (!user) {
      setError('Invalid email or password. Please try again.');
      return;
    }
    login(user);
    // Redirect based on role
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      navigate('/approvals', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const fillCredential = (index: number) => {
    setEmail(DEMO_CREDENTIALS[index].email);
    setPassword(DEMO_CREDENTIALS[index].password);
    setError('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <DollarSign size={28} />
          </div>
          <h1 className={styles.brandName}>{COMPANY_NAME}</h1>
          <p className={styles.brandSub}>Reimbursement Management System</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@techcorp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className={styles.demoBox}>
          <p className={styles.demoTitle}>Demo Accounts — click to autofill</p>
          <div className={styles.demoGrid}>
            {DEMO_CREDENTIALS.map((cred, i) => (
              <button
                key={cred.userId}
                type="button"
                className={styles.demoCard}
                onClick={() => fillCredential(i)}
              >
                <span className={`${styles.roleBadge} ${styles[`role${cred.role}`]}`}>
                  {cred.role}
                </span>
                <span className={styles.demoName}>{cred.label}</span>
                <span className={styles.demoEmail}>{cred.email}</span>
                <span className={styles.demoPw}>pw: {cred.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
