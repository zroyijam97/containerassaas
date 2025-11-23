import styles from './admin.module.css'

export default function AdminPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Admin Overview</h1>
        <div className={styles.actions}>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href="#">New Action</a>
          <a className={styles.btn} href="#">Settings</a>
        </div>
      </div>
      <div className={styles.cardGrid}>
        <div className={styles.card}>Users</div>
        <div className={styles.card}>Storage</div>
        <div className={styles.card}>Databases</div>
      </div>
    </div>
  )
}
