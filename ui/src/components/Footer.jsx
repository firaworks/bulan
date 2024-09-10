import React from 'react';
import Link from '../components/Link';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const [t, i18n] = useTranslation("global");

  return (
    <footer className="footer">
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
          <a href={`mailto:${import.meta.env.VITE_EMAILCONTACT}`} className="footer-item">
            {t("footer.contact")}
          </a>
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
          <div className="footer-title">Policies</div>
          <Link className="footer-item" to="/terms">
            {t("footer.terms")}
          </Link>
          <Link className="footer-item" to="/privacy-policy">
            {t("footer.privacy")}
          </Link>
          <Link className="footer-item" to="guidelines">
            {t("footer.guidelines")}
          </Link>
          <a
            className="footer-item"
            href="https://docs.discuit.net/"
            target="_blank"
            rel="noopener"
          >
            {t("footer.documentation")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
