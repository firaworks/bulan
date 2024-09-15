import React from 'react';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

const Offline = () => {
  const [t, i18n] = useTranslation("global");
  const handleRetry = () => window.location.reload();
  return (
    <>
      <Navbar offline />
      <div className="page-content page-notfound page-offline">
        <h1>{t("offline")}</h1>
        <p>{t('connection')}</p>
        <button onClick={handleRetry}>{t("retry")}</button>
      </div>
    </>
  );
};

export default Offline;
