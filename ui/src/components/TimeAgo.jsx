import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { timeAgo } from '../helper';
import { useTranslation } from 'react-i18next';

const TimeAgo = ({ time, inline = true, prefix = '', suffix = ' ago', short = false, ...rest }) => {
  const [tr, i18n] = useTranslation("global");
  if (!(time instanceof Date)) {
    // eslint-disable-next-line no-param-reassign
    time = new Date(time);
    // time.setHours(time.getHours() - 8);
  }
  suffix = tr("timeago.suffix")
  const [, setCounter] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((c) => c + 1);
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return React.createElement(
    inline ? 'span' : 'div',
    {
      title: time.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }),
      ...rest,
    },
    `${prefix}${timeAgo(time, suffix, true, short, i18n.language)}`
  );
};

TimeAgo.propTypes = {
  time: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  inline: PropTypes.bool,
  short: PropTypes.bool,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
};

export default TimeAgo;
