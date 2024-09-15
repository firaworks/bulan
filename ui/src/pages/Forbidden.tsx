import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Forbidden() {
  const [t, i18n] = useTranslation("global");
  return (
    <div className="page-content page-full">
      <h1>{t("forbidden")}</h1>
      <div>
        <Link to="/">{t("go_home")}</Link>.
      </div>
    </div>
  );
}
