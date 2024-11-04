import React from 'react';
import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <StaticPage className="" title={t("privacy_policy.title")}>
      <main className="document">
        <h1>{t("privacy_policy.title")}</h1>
        <p>{t("privacy_policy.general")}</p>
        <ol>
          <li>
            <strong>{t("privacy_policy.subtitle1")}</strong>
            <ol>
              <li>{t("privacy_policy.subtitle1_1")}<br /> {t("privacy_policy.subtext1_1")}</li>
              <li>{t("privacy_policy.subtitle1_2")}<br /> {t("privacy_policy.subtext1_2")}</li>
              <li>{t("privacy_policy.subtitle1_3")}<br /> {t("privacy_policy.subtext1_3")}</li>
            </ol>
          </li>
          <li>
            <strong>{t("privacy_policy.subtitle2")}</strong>
            <ol>
              <li>{t("privacy_policy.subtitle2_1")}<br /> {t("privacy_policy.subtext2_1")}</li>
              <li>{t("privacy_policy.subtitle2_2")}<br /> {t("privacy_policy.subtext2_2")}</li>
              <li>{t("privacy_policy.subtitle2_3")}<br /> {t("privacy_policy.subtext2_3")}</li>
            </ol>
          </li>
          <li>
            <strong>{t("privacy_policy.subtitle3")}</strong>
            <ol>
              <li>
                {t("privacy_policy.subtitle3_1")}<br /> {t("privacy_policy.subtext3_1")}
                <ul>
                  <li>{t("privacy_policy.subtext3_1_1")}</li>
                  <li>{t("privacy_policy.subtext3_1_2")}</li>
                  <li>{t("privacy_policy.subtext3_1_3")}</li>
                </ul>
              </li>
              <li>{t("privacy_policy.subtitle3_2")}<br /> {t("privacy_policy.subtext3_2")}</li>
            </ol>
          </li>
          <li><strong>{t("privacy_policy.subtitle4")}</strong><br /> {t("privacy_policy.subtext4")}</li>
          <li>
            <strong>{t("privacy_policy.subtitle5")}</strong><br />{t("privacy_policy.subtext5")}
            <ul>
              <li>{t("privacy_policy.subtext5_1")}</li>
              <li>{t("privacy_policy.subtext5_2")}</li>
              <li>{t("privacy_policy.subtext5_3")}</li>
            </ul>
          </li>
          <li><strong>{t("privacy_policy.subtitle6")}</strong><br /> {t("privacy_policy.subtext6")}</li>
        </ol>
        <p>
          {t('privacy_policy.footer')}
        </p>
      </main>
    </StaticPage>
  );
};

export default PrivacyPolicy;
