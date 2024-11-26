import { useEffect } from 'react';
import Link from '../components/Link';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const [t, i18n] = useTranslation("global");

  const className = 'footer';

  // For some reason, on Firefox desktop, there's a small (2 pixels perhaps)
  // white bar on the bottom of the page. This useEffect hook gets rid of that
  // by making it the background color of the footer.
  useEffect(() => {
    const background = document.documentElement.style.background;
    document.documentElement.style.background = window.getComputedStyle(
      document.querySelector(className)
    ).background;
    return () => {
      document.documentElement.style.background = background;
    };
  }, []);

  return (
    <footer className={className}>
      <div className="wrap">
        <div className="footer-col footer-show">
          <Link to="/" className="footer-logo">
            {import.meta.env.VITE_SITENAME}
          </Link>
          <div className="footer-description">{t("footer.title")}</div>
        </div>
        <div className="footer-col">
          <div className="footer-title">{t("footer.organization")}</div>
          <Link to="/about" className="footer-item">
            {t("footer.about")}
          </Link>
          <span className="footer-item">contact@bulan.mn</span>
          {/* <a href={`mailto:${import.meta.env.VITE_EMAILCONTACT}`} className="footer-item">
            {t("footer.contact")}
          </a> */}
        </div>
        <div className="footer-col">
          <div className="footer-title">{t("footer.social")}</div>
          {import.meta.env.VITE_TWITTERURL && (
            <a
              href={import.meta.env.VITE_TWITTERURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Twitter / X
            </a>
          )}
          {import.meta.env.VITE_SUBSTACKURL && (
            <a
              href={import.meta.env.VITE_SUBSTACKURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Blog
            </a>
          )}
          {import.meta.env.VITE_FACEBOOKURL && (
            <a
              href={import.meta.env.VITE_FACEBOOKURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Facebook
            </a>
          )}
          {import.meta.env.VITE_INSTAGRAMURL && (
            <a
              href={import.meta.env.VITE_INSTAGRAMURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Instagram
            </a>
          )}
          {import.meta.env.VITE_DISCORDURL && (
            <a
              href={import.meta.env.VITE_DISCORDURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Discord
            </a>
          )}
          {import.meta.env.VITE_GITHUBURL && (
            <a
              href={import.meta.env.VITE_GITHUBURL}
              className="footer-item"
              target="_blank"
              rel="noopener"
            >
              Github
            </a>
          )}
        </div>
        <div className="footer-col">
          <div className="footer-title">{t('footer.policies')}</div>
          <Link className="footer-item" to="/terms">
            {t("footer.terms")}
          </Link>
          <Link className="footer-item" to="/privacy-policy">
            {t("footer.privacy")}
          </Link>
          <Link className="footer-item" to="/guidelines">
            {t("footer.guidelines")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
