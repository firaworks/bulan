import PropTypes from 'prop-types';
import React from 'react';
import { stringCount } from '../../helper';
import { useTranslation } from 'react-i18next';

const PostVotesBar = ({ up = 20000, down = 1000 }) => {
  const [t, i18n] = useTranslation("global");
  const w = down === 0 ? 0 : (down / (up + down)) * 100;
  const u = up === 0 ? 0 : (up / (up + down)) * 100;
  const none = up + down === 0;
  const title = none
    ? t('no_votes')
    : `${u.toFixed(0)}% upvoted • ${up.toLocaleString()} ${stringCount(
      up,
      true,
      t('upvotes')
    )} • ${down.toLocaleString()} ${stringCount(down, true, t('downvotes'))}`;
  return (
    <div className="post-card-votes-bar" title={title}>
      <div className={'votes-bar' + (none ? ' is-no-votes' : '')}>
        <div className="votes-bar-up"></div>
        <div className="votes-bar-down" style={{ width: `${w}%` }}></div>
      </div>
    </div>
  );
};

PostVotesBar.propTypes = {
  up: PropTypes.number.isRequired,
  down: PropTypes.number.isRequired,
};

export default PostVotesBar;
