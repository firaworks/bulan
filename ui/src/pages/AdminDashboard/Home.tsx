import { useTranslation } from "react-i18next";

export default function Home() {
  const [t, i18next] = useTranslation("global");
  return (
    <div className="dashboard-page-home document">
      <div className="dashboard-page-title">{t("home")}</div>
      <div className="dashboard-page-content">
        <p>{t("under_construction")}</p>
      </div>
    </div>
  );
}
