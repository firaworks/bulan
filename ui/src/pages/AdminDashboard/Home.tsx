import { useTranslation } from "react-i18next";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [t] = useTranslation("global");
  return (
    <div className="dashboard-page-home document">
      <div className="dashboard-page-title">{t("home")}</div>
      <div className="dashboard-page-content">
        <p>{t("under_construction")}</p>
      </div>
    </div>
  );
}
