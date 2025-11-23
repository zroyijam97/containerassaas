import styles from './dashboard.module.css'

export default function DashboardPage() {
  return (
    <div>
      <h1>Learn</h1>
      <p>Expand your skills with webinars and online courses.</p>
      <div style={{ marginTop: 24, color: '#7a8599' }}>No webinars available</div>
      <div style={{ marginTop: 24 }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e9ee',
          borderRadius: 12,
          padding: 16,
          maxWidth: 420
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Online Courses</div>
          <div style={{ height: 120, background: '#eef1f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8599' }}>
            Webinar
          </div>
          <div style={{ marginTop: 12 }}>
            <a href="#" style={{
              display: 'inline-block',
              background: '#6c47ff',
              color: '#fff',
              borderRadius: 999,
              padding: '10px 14px',
              fontWeight: 600
            }}>Start Learning</a>
          </div>
        </div>
      </div>
    </div>
  )
}
