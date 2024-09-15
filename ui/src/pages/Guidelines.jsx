import React from 'react';
import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const Guidelines = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <StaticPage className="page-guidelines" title="Guidelines">
      <main className="document">
        <h1>{t("guidelines.title_1")}</h1>
        <p>
          {t("guidelines.text_1")}
        </p>
        <p>
          {t("guidelines.text_2")}
        </p>
        <h2>{t("guidlines.title_2")}</h2>
        <ol>
          <li>
            <strong>{t("guidelines.text_3")}</strong> {t("guidelines.text_4")}
          </li>
          <li>
            <strong>{t('guidelines.text_5')}</strong> {t('guidelines.text_6')}
          </li>
          <li>
            <p>
              <strong>{t("guidelines.text_7")}</strong>  {t("guidelines.text_8")}
            </p>
            <p>
              {t("guidelines.text_9")}
            </p>
            <p>
            {t("guidelines.text_10")}
            </p>
          </li>
          <li>
            <strong>{t("guidelines.text_11")}</strong> {t("guidelines.text_12")}
          </li>
          <li>
            <strong>{t('guidelines.text_13')}</strong> {t('guidelines.text_14')}
          </li>
          <li>
            <strong>{t('guidelines.text_15')}</strong> {t('guidelines.text_16')}
          </li>
          <li>
            <strong>{t('guidelines.text_17')}</strong> {t('guidelines.text_18')}
          </li>
        </ol>
        <p>
        {t('guidelines.text_19')}
        </p>
        <p>
        {t('guidelines.text_20')}
        </p>
      </main>
    </StaticPage>
  );
};

export default Guidelines;
