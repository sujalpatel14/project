import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h2>CodeVerse</h2>
        </div>

        <div className={styles.links}>
          <ul>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/community">Community</a></li>
            <li><a href="/certifications">Certifications</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className={styles.socialMedia}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} CodeVerse. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
