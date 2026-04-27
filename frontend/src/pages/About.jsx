import { useNavigate } from 'react-router-dom';
import s from './About.module.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className={s.page}>
      <header className={s.header}>
        <span className={`${s.logo} pixel`}>SNAKE</span>
        <button className={s.back} onClick={() => navigate('/game')}>
          ← Back
        </button>
      </header>

      <main className={s.main}>

        <section className={s.hero}>
          <p className={s.heroLabel}>Three-Tier Kubernetes Project</p>
          <h1 className={s.heroTitle}>About This Game</h1>
          <p className={s.heroDesc}>
            A Snake Game built as a production-ready three-tier application.
            Every score is saved to MongoDB and displayed on the live leaderboard.
            Deployed on Kubernetes with a full DevSecOps CI/CD pipeline.
          </p>
        </section>

        <div className={s.cards}>
          <div className={s.card}>
            <p className={s.cardTag}>Architecture</p>
            <p className={s.cardTitle}>Three-Tier</p>
            <p className={s.cardDesc}>React frontend, Node.js backend, auth microservice, and MongoDB — each running as an independent Kubernetes pod on a multi-node Kind cluster.</p>
          </div>
          <div className={s.card}>
            <p className={s.cardTag}>CI/CD</p>
            <p className={s.cardTitle}>DevSecOps Pipeline</p>
            <p className={s.cardDesc}>Jenkins pipelines with SonarQube code quality gates and Trivy image scanning. Deployment blocked on HIGH and CRITICAL vulnerabilities.</p>
          </div>
          <div className={s.card}>
            <p className={s.cardTag}>Deployment</p>
            <p className={s.cardTitle}>Helm + Kubernetes</p>
            <p className={s.cardDesc}>Packaged as a Helm chart with StatefulSet for MongoDB, Nginx Ingress routing, PersistentVolumeClaim, and security context on all pods.</p>
          </div>
          <div className={s.card}>
            <p className={s.cardTag}>Auth</p>
            <p className={s.cardTitle}>JWT Microservice</p>
            <p className={s.cardDesc}>Dedicated auth microservice with bcrypt password hashing and JWT tokens. Every score is tied to the authenticated user.</p>
          </div>
        </div>

        <section className={s.stack}>
          <p className={s.stackLabel}>Stack</p>
          <div className={s.tags}>
            {['React', 'Node.js', 'MongoDB', 'JWT', 'Docker',
              'Kubernetes', 'Helm', 'Jenkins', 'SonarQube', 'Trivy', 'Nginx'
            ].map(t => (
              <span key={t} className={s.tag}>{t}</span>
            ))}
          </div>
        </section>

        <section className={s.author}>
          <p className={s.authorTag}>Built by</p>
          <p className={s.authorName}>Akif Muhammed MC</p>
          <p className={s.authorRole}>Cloud & DevOps Engineer — Kerala, India</p>
          <p className={s.authorBio}>
            Started with Git just for fun. Ended up building production-grade
            Kubernetes deployments with full DevSecOps pipelines — all within a few months.
          </p>
          <div className={s.links}>
            <a href="https://github.com/x091204" target="_blank" rel="noreferrer">GitHub →</a>
            <a href="https://in.linkedin.com/in/akifmuhammedmc" target="_blank" rel="noreferrer">LinkedIn →</a>
          </div>
        </section>

      </main>
    </div>
  );
}