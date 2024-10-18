import React from 'react';
import Link from '../components/Link';
import { useTranslation } from 'react-i18next';

const MiniFooter = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <footer className="mini-footer">
      <Link to="/about">{t("mini_footer.about")}</Link>
      <Link to="/terms">{t("mini_footer.terms")}</Link>
      <Link to="/privacy-policy">{t("mini_footer.privacy")}</Link>
      <Link to="/guidelines">{t("mini_footer.guidelines")}</Link>
      <a href={`mailto:${import.meta.env.VITE_EMAILCONTACT}`}>{t("mini_footer.contact")}</a>
      <span>© 2024 {import.meta.env.VITE_SITENAME}.</span>
    </footer>
  );
};

export default MiniFooter;
