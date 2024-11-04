import React, { useState } from 'react';
import Link from '../components/Link';
import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const About = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <StaticPage className="page-about" title="About" noWrap>
      <div className="about-landing">
        <div className="wrap">
          <h1 className="about-heading heading-highlight">
            {t("about_page.title")}
          </h1>
          <h2 className="about-subheading">

          </h2>
        </div>
        <div className="squiggly-line"></div>
      </div>
      <div className="about-rest" style={{ textAlign: "justify" }}>
        <div className="wrap">
          <div className="about-section about-mission">
            <p style={{ whiteSpace: "pre-line" }}>
              {t("about_page.general1")}
            </p>
            <p>
              {t("about_page.general2")}
            </p>
          </div>
          <div className="about-section about-highlights">
            <div className="about-highlight">
              <span className="is-bold">{t("about_page.subtitle1")}</span>
              <br />
              {t("about_page.subtext1")}
            </div>
            <div className="about-highlight">
              <span className="is-bold">{t("about_page.subtitle2")}</span>
              <br />
              {t("about_page.subtext2")}
            </div>
            <div className="about-highlight">
              <span className="is-bold">Холбоо барих</span>
              <br />
              Бидэнтэй холбоо барих шаардлагатай бол <span style={{ color: "var(--color-link)" }}>contact@bulan.mn</span> хаяг руу мейл илгээнэ үү.
            </div>
          </div>
        </div>
      </div>
    </StaticPage>
  );
};

export default About;
