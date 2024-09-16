import { useTranslation } from "react-i18next";

export default function IPBans() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [t] = useTranslation("global");
  return (
    <div className="dashboard-page-ip-bans document">
      <h1>{t("ip_bans")}</h1>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure provident beatae tenetur
        ducimus ullam mollitia quod labore, quisquam voluptas neque.
      </p>
      <p style={{ height: '200vh' }}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis, voluptas esse quos
        voluptatum sit beatae facilis reiciendis mollitia nesciunt consectetur corrupti molestiae
        iusto vitae nisi at laboriosam possimus autem quidem modi ex nobis expedita? Aliquam
        distinctio sunt tenetur explicabo vero.
      </p>
    </div>
  );
}
