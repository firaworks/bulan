import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const Guidelines = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <StaticPage className="page-guidelines" title={t("guidelines.title")}>
      <main className="document">
        <h1>{t("guidelines.title")}</h1>
        <p>
          {t("guidelines.general")}
        </p>
        <h2>{t("guidelines.title2")}</h2>
        <ol>
          <li><strong>{t("guidelines.subtitle1")}</strong><br /> {t("guidelines.subtext1")}</li>
          <li><strong>{t("guidelines.subtitle2")}</strong><br /> {t("guidelines.subtext2")}</li>
          <li><strong>{t("guidelines.subtitle3")}</strong><br /> {t("guidelines.subtext3")}</li>
          <li><strong>{t("guidelines.subtitle4")}</strong><br /> {t("guidelines.subtext4")}</li>
          <li><strong>{t("guidelines.subtitle5")}</strong><br /> {t("guidelines.subtext5")}</li>
          <li><strong>{t("guidelines.subtitle6")}</strong><br /> {t("guidelines.subtext6")}</li>
          <li><strong>{t("guidelines.subtitle7")}</strong><br /> {t("guidelines.subtext7")}</li>
        </ol>
        <p>
          {t('guidelines.footer')}
        </p>
      </main>
    </StaticPage>
  );
};

export default Guidelines;
