import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import styles from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const adminEmail = process.env.ADMIN_EMAIL || ''
  const isAdmin = !!user && user.emailAddresses?.some(e => e.emailAddress === adminEmail)
  if (!isAdmin) redirect('/')

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Boss Auto</div>
        <nav className={styles.nav}>
          <div className={styles.group}>OVERVIEW</div>
          <a className={`${styles.item} ${styles.active}`} href="/admin">Dashboard</a>
          <div className={styles.group}>MANAGE</div>
          <a className={styles.item} href="/admin/landing-page">Landing Page</a>
          <a className={styles.item} href="/admin/product">Products</a>
          <a className={styles.item} href="/admin/earning">Earning</a>
          <a className={styles.item} href="/admin/managedigitalgoods">Manage Digital Products</a>
          <a className={styles.item} href="/admin/users">Users</a>
          <a className={styles.item} href="/admin/storage">Storage</a>
          <a className={styles.item} href="/admin/databases">Databases</a>
          <a className={styles.item} href="/admin/settings">Settings</a>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
