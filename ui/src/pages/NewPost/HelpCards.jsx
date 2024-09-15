import { t } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const HelpCardCommunity = () => {
  const [t, i18next] = useTranslation("global");

  return (
    <div className="newpost-help card-gray">
      <div className="newpost-help-title">{t("new_post.select_community")}</div>
      <p>{t("new_post.community_question")}</p>
    </div>
  );
};

export const HelpCardBody = () => {
  const [t, i18next] = useTranslation("global");
  return (
    <div className="newpost-help card-gray">
      <p>{t("new_post.content_instruct")}</p>
    </div>
  );
};

export const HelpCardTitle = () => {
  const [t, i18next] = useTranslation("global");
  return (
    <div className="newpost-help card-gray">
      <p>{t("new_post.char_limit")}</p>
    </div>
  );
};
