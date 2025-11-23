"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './dashboard.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || (pathname || '').startsWith(href)
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Boss Auto</div>
        <nav className={styles.nav}>
          <div className={styles.group}>LEARNING</div>
          <Link className={`${styles.item} ${isActive('/dashboard') ? styles.active : ''}`} href="/dashboard">Learn</Link>
          <a className={styles.item} href="#">Community</a>
          <div className={styles.group}>SERVICES</div>
          <a className={styles.item} href="#">AI</a>
          <a className={styles.item} href="#">Services</a>
          <Link className={`${styles.item} ${isActive('/dashboard/digital-products') ? styles.active : ''}`} href="/dashboard/digital-products">Digital Products</Link>
          <div className={styles.group}>INFRASTRUCTURE</div>
          <a className={styles.item} href="#">VPS</a>
          <a className={styles.item} href="#">Database</a>
          <div className={styles.group}>ACCOUNT</div>
          <Link className={`${styles.item} ${isActive('/dashboard/billing') ? styles.active : ''}`} href="/dashboard/billing">Billing</Link>
          <a className={styles.item} href="#">Affiliate</a>
          <a className={styles.item} href="#">Settings</a>
          <a className={styles.item} href="#">Support</a>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
