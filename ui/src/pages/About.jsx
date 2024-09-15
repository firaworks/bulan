import React, { useState } from 'react';
import Link from '../components/Link';
import StaticPage from '../components/StaticPage';
import { useTranslation } from 'react-i18next';

const About = () => {
  const [t, i18n] = useTranslation("global");
  const faqItems = [
    {
      question: t("about.faq.question_1"),
      answer: (
        <>
          {t("about.faq.answer_1")}
          <a href="https://www.patreon.com/discuit" target="_blank" rel="noreferrer">
            {t("about.faq.answer_1.2")}
          </a>
          .
        </>
      ),
    },
    {
      question: t("about.faq.question_2"),
      answer: t("about.faq.answer_2"),
    },
    {
      question: t("about.faq.question_3"),
      answer: (
        <>
          {t("about.faq.answer_3")}
        </>
      ),
    },
    {
      question: t("about.faq.question_4"),
      answer: (
        <>
          {t("about.faq.answer_4")}
          <Link to="/DiscoApp">Disco</Link> for iOS, and <Link to="/Diskette">Diskette</Link> for
          Android.
        </>
      ),
    },
    {
      question: t("about.faq.question_5"),
      answer: (
        <>
          {t("about.faq.answer_5")}{' '}
          <a href={`mailto:${import.meta.env.VITE_EMAILCONTACT}`}>
            {import.meta.env.VITE_EMAILCONTACT}
          </a>
          , or join our <a href={import.meta.env.VITE_DISCORDURL}>Discord server </a>
          (after you join, create a ticket to contact an admin).
        </>
      ),
    },
    {
      question: t("about.faq.question_6"),
      answer: (
        <>
          {t("about.faq.answer_6")}
          <Link to="/DiscuitMeta">DiscuitMeta</Link>
          {` community. If you have feedback or would like to report a bug, you can create a post in the `}
          <Link to="/DiscuitSuggestions">DiscuitSuggestions</Link>
          {` community (if you have a GitHub account, however, the best place to report a bug would be on `}
          <a href={`${import.meta.env.VITE_GITHUBURL}/issues`}>GitHub</a>
          {`)`}.
        </>
      ),
    },
  ];
  const [faqItemOpenedIndex, _setFaqItemOpenedIndex] = useState(null);
  const setFaqItemOpenedIndex = (index) => {
    _setFaqItemOpenedIndex((value) => {
      if (value === index) return null;
      return index;
    });
  };

  const renderFaqItems = () => {
    const elems = faqItems.map((item, index) => {
      const { question, answer } = item;
      const isOpen = faqItemOpenedIndex === index;
      return (
        <div className={'about-faq-item' + (isOpen ? ' is-open' : '')} key={index}>
          <div className="about-faq-question" onClick={() => setFaqItemOpenedIndex(index)}>
            <span>{question}</span>
            <svg
              width="19"
              height="10"
              viewBox="0 0 19 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1L9.5 8L17.5 1" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="about-faq-answer">{answer}</div>
        </div>
      );
    });
    return <>{elems}</>;
  };

  return (
    <StaticPage className="page-about" title="About" noWrap>
      <div className="about-landing">
        <div className="wrap">
          <h1 className="about-heading heading-highlight">
            {t("about.content.text_1")}
          </h1>
          <h2 className="about-subheading">
            {t("about.content.text_2")}
          </h2>
        </div>
        <div className="squiggly-line"></div>
      </div>
      <div className="about-rest">
        <div className="wrap">
          <div className="about-section about-mission">
            <p>
              {t("about.content.text_3")}
            </p>
            <p>
              {t("about.conent.text_4")}
            </p>
            {/*<p>
              {`For more information, see the article: `}
              <a href="https://discuit.substack.com" target="_blank" rel="noreferrer">
                {`Why we're building an alternative to Reddit.`}
              </a>
            </p>*/}
          </div>
          <div className="about-section about-highlights">
            <div className="about-highlight">
              <span className="is-bold">{t("about.content.text_5")}</span>
              {t("about.content.text_6")}
            </div>
            <div className="about-highlight">
              <span className="is-bold">{t("about.content.text_7")}</span>
              {t("about.content.text_8")}
            </div>
            <div className="about-highlight">
              <span className="is-bold">{t("about.content.text_9")}</span>
              {t("about.content.text_10")}
            </div>
            <div className="about-highlight">
              <span className="is-bold">{t("about.content.text_11")}</span>
              {t('about.content.text_12')}
            </div>
          </div>
          <div className="about-section about-faq">
            <div className="about-faq-title">{t("about.content.text_13")}</div>
            <div className="about-faq-list">{renderFaqItems()}</div>
          </div>
        </div>
      </div>
    </StaticPage>
  );
};

export default About;
