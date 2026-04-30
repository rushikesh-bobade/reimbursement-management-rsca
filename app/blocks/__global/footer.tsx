import { NavLink } from 'react-router';
import { DollarSign, GitMerge, MessageSquare, Link2, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import classnames from 'classnames';
import style from './footer.module.css';
import { COMPANY_NAME, BASE_CURRENCY } from '~/data/mock-data';

export interface FooterProps {
  className?: string;
}

const FOOTER_LINKS = {
  platform: [
    { label: 'Dashboard', to: '/' },
    { label: 'Submit Expense', to: '/submit-expense' },
    { label: 'Pending Approvals', to: '/approvals' },
    { label: 'User Management', to: '/admin/users' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Status Page', href: '#' },
  ],
};

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={classnames(style.footer, className)}>
      <div className={style.inner}>
        {/* Brand column */}
        <div className={style.brandCol}>
          <NavLink to="/" className={style.brand}>
            <div className={style.brandIconWrap}>
              <DollarSign size={16} />
            </div>
            <span className={style.brandName}>{COMPANY_NAME}</span>
          </NavLink>
          <p className={style.brandTagline}>
            Streamlining expense reimbursements across your organization with smart multi-level approval workflows.
          </p>
          <div className={style.contact}>
            <div className={style.contactRow}>
              <Mail size={13} className={style.contactIcon} />
              <span>support@techcorp.com</span>
            </div>
            <div className={style.contactRow}>
              <Phone size={13} className={style.contactIcon} />
              <span>+1 (800) 555-0190</span>
            </div>
            <div className={style.contactRow}>
              <MapPin size={13} className={style.contactIcon} />
              <span>San Francisco, CA 94103</span>
            </div>
          </div>
          <div className={style.socials}>
            <a href="#" className={style.socialBtn} aria-label="GitHub"><GitMerge size={15} /></a>
            <a href="#" className={style.socialBtn} aria-label="Twitter"><MessageSquare size={15} /></a>
            <a href="#" className={style.socialBtn} aria-label="LinkedIn"><Link2 size={15} /></a>
          </div>
        </div>

        {/* Platform links */}
        <div className={style.linkCol}>
          <h4 className={style.colHeading}>Platform</h4>
          <ul className={style.linkList}>
            {FOOTER_LINKS.platform.map((l) => (
              <li key={l.label}>
                <NavLink to={l.to} className={style.footerLink}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div className={style.linkCol}>
          <h4 className={style.colHeading}>Company</h4>
          <ul className={style.linkList}>
            {FOOTER_LINKS.company.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={style.footerLink}>
                  {l.label}
                  <ExternalLink size={11} className={style.extIcon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support links */}
        <div className={style.linkCol}>
          <h4 className={style.colHeading}>Support</h4>
          <ul className={style.linkList}>
            {FOOTER_LINKS.support.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={style.footerLink}>
                  {l.label}
                  <ExternalLink size={11} className={style.extIcon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter / status column */}
        <div className={style.linkCol}>
          <h4 className={style.colHeading}>Stay Updated</h4>
          <p className={style.newsletterText}>Get notified about system updates and new features.</p>
          <form className={style.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className={style.newsletterInput}
              aria-label="Email for newsletter"
            />
            <button type="submit" className={style.newsletterBtn}>Subscribe</button>
          </form>
          <div className={style.statusBadge}>
            <span className={style.statusDot} />
            All systems operational
          </div>
        </div>
      </div>

      <Separator.Root className={style.divider} />

      <div className={style.bottom}>
        <span className={style.copy}>&copy; {year} {COMPANY_NAME}. All rights reserved.</span>
        <div className={style.bottomRight}>
          <span className={style.bottomTag}>Base currency: <strong>{BASE_CURRENCY}</strong></span>
          <span className={style.bottomTag}>v2.4.1</span>
          <a href="#" className={style.bottomLink}>Privacy</a>
          <a href="#" className={style.bottomLink}>Terms</a>
        </div>
      </div>
    </footer>
  );
}
