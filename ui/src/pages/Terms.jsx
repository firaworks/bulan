import React from 'react';
import Link from '../components/Link';
import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <StaticPage className="" title={t("terms_of_service.title")} description={t("terms_of_service.title")}>
      <main className="document">
        <h1>{t("terms_of_service.title")}</h1>
        <p>{t("terms_of_service.general")}</p>
        <ol>
          <li>
            <strong>{t("terms_of_service.subtitle1")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext1_1")}</li>
              <li>{t("terms_of_service.subtext1_2")}</li>
              <li>{t("terms_of_service.subtext1_3")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle2")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext2_1")}</li>
              <li>{t("terms_of_service.subtext2_2")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle3")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext3_1")}</li>
              <li>{t("terms_of_service.subtext3_2")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle4")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext4_1")}</li>
              <li>{t("terms_of_service.subtext4_2")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle5")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext5_1")}</li>
              <li>{t("terms_of_service.subtext5_2")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle6")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext6_1")}</li>
              <li>{t("terms_of_service.subtext6_2")}</li>
            </ul>
          </li>
          <li>
            <strong>{t("terms_of_service.subtitle7")}</strong>
            <ul>
              <li>{t("terms_of_service.subtext7_1")}</li>
            </ul>
          </li>

        </ol>
        <p>
          {t('privacy_policy.footer')}
        </p>
      </main>
    </StaticPage>
  );
};

export default Terms;
