import PropTypes from 'prop-types';
import React from 'react';
import MarkdownBody from '../../components/MarkdownBody';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

export const RulesItems = ({ rules, unordered = false }) => {
  const [t, i18next] = useTranslation("global");
  let orules = rules;
  if (unordered) {
    orules = [...rules];
    orules.sort((a, b) => a > b);
  }

  const renderText = (markdown) => {
    return <MarkdownBody veryBasic>{markdown}</MarkdownBody>;
  };

  return (
    <>
      {orules.map((rule, i) => (
        <React.Fragment key={rule.id}>
          <div>{i + 1}.</div>
          <div>{renderText(rule.rule)}</div>
          <div></div>
          <div>{renderText(rule.description)}</div>
        </React.Fragment>
      ))}
    </>
  );
};

RulesItems.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object).isRequired,
  unordered: PropTypes.bool,
};

const Rules = ({ rules, unordered = false }) => {
  if (!rules) {
    return null;
  }

  return (
    <div className="card card-sub card-rules">
      <div className="card-head">
        <div className="card-title">{t("community_rules")}</div>
      </div>
      <div className="card-content">
        <div className="card-rules-rules">
          <RulesItems rules={rules} unordered={unordered} />
        </div>
      </div>
    </div>
  );
};

Rules.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object).isRequired,
  unordered: PropTypes.bool,
};

export default Rules;
