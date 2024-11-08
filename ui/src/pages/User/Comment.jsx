import PropTypes from 'prop-types';
import React from 'react';
import Link from '../../components/Link';
import MarkdownBody from '../../components/MarkdownBody';
import ShowMoreBox from '../../components/ShowMoreBox';
import TimeAgo from '../../components/TimeAgo';
import { kRound, stringCount } from '../../helper';
import { useTranslation } from 'react-i18next';

const Comment = ({ comment, onRemoveFromList = null }) => {
  const [t, i18n] = useTranslation("global");
  return (
    <div className="comment">
      <div className="comment-head">
        <Link className="comment-username" to={`/@${comment.username}`}>
          {`@${comment.username}`}
        </Link>
        <span>{t('ni')}</span>
        <Link to={`/${comment.communityName}`} style={{ color: 'inherit', fontWeight: '600' }}>
          {comment.communityName}
        </Link>
        <span>{t('of_community')}</span>
        <Link
          className="comment-post-title"
          to={`/${comment.communityName}/post/${comment.postPublicId}`}
        >
          {comment.postTitle}
        </Link>
        <span>{t('left_comment_on_post')}.</span>
        <span>
          <TimeAgo time={comment.createdAt} />.
        </span>
      </div>
      <Link
        className="comment-body"
        to={`/${comment.communityName}/post/${comment.postPublicId}/${comment.id}`}
      >
        <ShowMoreBox>
          <MarkdownBody noLinks>{comment.body}</MarkdownBody>
        </ShowMoreBox>
      </Link>
      <div className="comment-footer">
        <div className="comment-score">
          {`${kRound(comment.upvotes)} ${stringCount(comment.upvotes, true, t('upvotes'))} • ${kRound(
            comment.downvotes
          )} ${stringCount(comment.downvotes, true, t('downvotes'))}`}
        </div>
        <div className="comment-remove">
          {onRemoveFromList && (
            <button className="button-clear" onClick={() => onRemoveFromList(comment.id)}>
              {t("remove")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  onRemoveFromList: PropTypes.func,
};

export default Comment;

export const MemorizedComment = React.memo(Comment);
