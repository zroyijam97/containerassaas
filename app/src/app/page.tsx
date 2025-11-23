import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Deploy Applications in 15 Seconds</h1>
          <p className={styles.subtitle}>
            Simple, modern container management with one‑click deployment, automatic updates,
            and a verified marketplace.
          </p>
          <div className={styles.actions}>
            <a className={styles.ctaPrimary} href="#get-started">Start Today</a>
            <a className={styles.ctaSecondary} href="#features">Explore Features</a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.glow} />
          <div className={styles.card}>Container Marketplace</div>
          <div className={styles.card}>One‑Click Deployment</div>
          <div className={styles.card}>Automatic Updates</div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>One‑Click Deploy</h3>
          <p className={styles.featureText}>Launch verified containers to your infra in seconds.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3 className={styles.featureTitle}>Secure by Default</h3>
          <p className={styles.featureText}>Automatic updates and patches keep apps protected.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🧩</div>
          <h3 className={styles.featureTitle}>Marketplace</h3>
          <p className={styles.featureText}>Browse curated images ready for instant deployment.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📈</div>
          <h3 className={styles.featureTitle}>Scales Effortlessly</h3>
          <p className={styles.featureText}>Grow from dev to production without changing tooling.</p>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.pricingCard}>
          <div className={styles.badge}>FREE</div>
          <h3 className={styles.pricingTitle}>Everything you need</h3>
          <ul className={styles.pricingList}>
            <li>Unlimited deployments</li>
            <li>Verified container library</li>
            <li>Automatic version updates</li>
            <li>Secure patches</li>
          </ul>
          <a id="get-started" className={styles.pricingCta} href="#">Start for Free</a>
        </div>
      </section>

      <section className={styles.footerCta}>
        <p>Ready to transform your container management?</p>
        <a className={styles.footerButton} href="#get-started">Join Now</a>
      </section>
    </div>
  );
}
