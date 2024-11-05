import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useRemoveCanonicalTag } from '../hooks';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const [t, i18n] = useTranslation("global");
  useRemoveCanonicalTag();
  return (
    <div className="page-content page-notfound">
      <Helmet>
        <title>404: {t("not_found")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Sidebar />
      <h1>404: {t("not_found")}!</h1>
      <p>{t("page_does_not_exist")}</p>
      <Link to="/">{t("go_home")}</Link>
    </div>
  );
};

export default NotFound;
