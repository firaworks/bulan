import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import Favicon from '../../assets/imgs/favicon.png';
import { mfetchjson, selectImageCopyURL, stringCount } from '../../helper';
import { badgeImage } from '../../pages/User/badgeImage';
import {
  markNotificationAsSeen,
  notificationsDeleted,
  snackAlertError,
} from '../../slices/mainSlice';
import { ButtonMore } from '../Button';
import Dropdown from '../Dropdown';
import Image from '../Image';
import TimeAgo from '../TimeAgo';
import { Trans, useTranslation } from "react-i18next";

const NotificationItem = ({ notification, ...rest }) => {
  const { type, seen, createdAt, notif } = notification;
  const [t, i18n] = useTranslation("global");
  const viewer = useSelector((state) => state.main.user);

  const [actionBtnHovering, setActionBtnHovering] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);

  const dispatch = useDispatch();
  const handleMarkAsSeen = () => dispatch(markNotificationAsSeen(notification, !seen));
  const handleDelete = async () => {
    try {
      await mfetchjson(`/api/notifications/${notification.id}`, { method: 'DELETE' });
      dispatch(notificationsDeleted(notification));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const renderText = () => {
    switch (type) {
      case 'new_comment': {
        if (notif.noComments === 1) {
          return (
            < >
              <Trans i18nKey="notifications.new_comment"
                values={{ who: `@${notif.commentAuthor}`, title: notif.post.title }}
                components={{ bold: <b /> }}
              />
            </>
          );
        } else {
          return (
            <>
              <Trans i18nKey="notifications.new_comments"
                values={{
                  title: notif.post.title,
                  num: notif.noComments
                }}
                components={{ bold: <b /> }}
              />
            </>
          );
        }
      }
      case 'comment_reply': {
        if (notif.noComments === 1) {
          return (
            <>
              <Trans i18nKey="notifications.comment_reply"
                values={{
                  who: `@${notif.commentAuthor}`,
                  title: notif.post.title,
                }}
                components={{ bold: <b /> }}
              />
            </>
          );
        } else {
          return (
            <>
              <Trans i18nKey="notifications.comment_replies"
                values={{
                  title: notif.post.title,
                  num: notif.noComments,
                }}
                components={{ bold: <b /> }}
              />
            </>
          );
        }
      }
      case 'new_votes': {
        if (notif.targetType === 'post') {
          return (
            <>
              <Trans i18nKey="notifications.new_votes_on_post"
                values={{
                  title: notif.post.title,
                  num: notif.noVotes,
                }}
                components={{ bold: <b /> }}
              />
            </>
          );
        } else {
          return (
            <>
              <Trans i18nKey="notifications.new_votes_on_comment"
                values={{
                  title: notif.post.title,
                  num: notif.noVotes,
                }}
                components={{ bold: <b /> }}
              />
            </>
          );
        }
      }
      case 'deleted_post': {
        return (
          <>
            <Trans i18nKey="notifications.deleted_post"
              values={{
                title: notif.post.title,
                who: notif.deletedAs === 'mods' ? `${notif.post.communityName} ${t('by_mods_of')}` : t('by_admins')
              }}
              components={{ bold: <b /> }}
            />
          </>
        );
      }
      case 'mod_add': {
        return (
          <>
            <Trans i18nKey="notifications.mod_add"
              values={{
                who: `@${notif.addedBy}`,
                community: notif.communityName
              }}
              components={{ bold: <b /> }}
            />
          </>
        );
      }
      case 'new_badge': {
        return (
          <>
            <Trans i18nKey="notifications.new_badge" />
          </>
        );
      }
      case 'comment_mention': {
        return (
          <>
            <Trans i18nKey="notifications.comment_mention"
              values={{
                who: `@${notif.commentAuthor}`,
                title: notif.post.title
              }}
              components={{ bold: <b /> }} />
          </>
        );
      }
      default: {
        return null; // unknown notification type
      }
    }
  };

  const defaultImage = { url: Favicon, backgroundColor: '#3d3d3d' };
  const getNotifImage = (notif) => {
    let image = Favicon,
      background = '#3d3d3d';
    if (notif.post) {
      switch (notif.post.type) {
        case 'image':
          if (notif.post.image) {
            image = selectImageCopyURL('tiny', notif.post.image);
            background = notif.post.image.averageColor;
          }
          break;
        case 'link':
          if (notif.post.link && notif.post.link.image) {
            image = selectImageCopyURL('tiny', notif.post.link.image);
            background = notif.post.link.image.averageColor;
          }
          break;
      }
    } else if (typeof notif.community === 'object' && notif.community !== null) {
      if (notif.community.proPic) {
        image = selectImageCopyURL('small', notif.community.proPic);
        background = notif.community.proPic.averageColor;
      }
    }
    return { url: image, backgroundColor: background };
  };

  let image = defaultImage;
  let to = '';
  switch (type) {
    case 'new_comment':
      to = `/${notif.post.communityName}/post/${notif.post.publicId}`;
      if (notif.noComments === 1) to += `/${notif.commentId}`;
      else to += `?notifId=${notification.id}`;
      image = getNotifImage(notif);
      break;
    case 'comment_reply':
      to = `/${notif.post.communityName}/post/${notif.post.publicId}`;
      if (notif.noComments === 1) to += `/${notif.commentId}`;
      else to += `?notifId=${notification.id}`;
      image = getNotifImage(notif);
      break;
    case 'new_votes':
      if (notif.targetType === 'post') {
        to = `/${notif.post.communityName}/post/${notif.post.publicId}`;
      } else {
        to = `/${notif.comment.communityName}/post/${notif.comment.postPublicId}/${notif.comment.id}`;
      }
      image = getNotifImage(notif);
      break;
    case 'deleted_post':
      // Currently only deleted post notifications get here.
      to = `/${notif.post.communityName}/post/${notif.post.publicId}`;
      image = getNotifImage(notif);
      break;
    case 'mod_add':
      to = `/${notif.communityName}`;
      image = getNotifImage(notif);
      break;
    case 'new_badge': {
      to = `/@${viewer.username}`;
      const { src } = badgeImage(notif.badgeType);
      image = {
        url: src,
        backgroundColor: 'transparent',
      };
      break;
    }
    case 'comment_mention':
      to = `/${notif.post.communityName}/post/${notif.post.publicId}/${notif.commentId}`;
      image = getNotifImage(notif);
      break;
  }

  const actionsRef = useRef();
  const history = useHistory();
  const handleClick = (e) => {
    e.preventDefault();
    if (
      !actionsRef.current.contains(e.target) &&
      !document.querySelector('#modal-root').contains(e.target)
    ) {
      if (!seen) handleMarkAsSeen();
      history.push(to, {
        fromNotifications: true,
      });
    }
  };

  const notifText = renderText();
  if (notifText === null) {
    return null; // notification type is unknown
  }

  return (
    <a
      href={to}
      className={
        'link-reset notif' +
        (seen ? ' is-seen' : '') +
        (actionBtnHovering ? ' is-btn-hovering' : '')
      }
      onClick={handleClick}
      {...rest}
    >
      <div className="notif-icon">
        <Image src={image.url} backgroundColor={image.backgroundColor} alt="" />
      </div>
      <div className="notif-body">
        <div className="notif-text">{notifText}</div>
        <div className="notif-time">
          <TimeAgo time={createdAt} inline={false} />
        </div>
      </div>
      <div
        ref={actionsRef}
        className={'notif-action-btn' + (dropdownActive ? ' is-active' : '')}
        onMouseEnter={() => setActionBtnHovering(true)}
        onMouseLeave={() => setActionBtnHovering(false)}
      >
        <Dropdown
          target={<ButtonMore />}
          aligned="right"
          onActiveChange={(active) => setDropdownActive(active)}
        >
          <div className="dropdown-list">
            <button className="button-clear dropdown-item" onClick={handleMarkAsSeen}>
              {seen ? t("notifications.mark_seen") : t("notifications.mark_unseen")}
            </button>
            <button className="button-clear dropdown-item" onClick={handleDelete}>
              {t('_delete')}
            </button>
          </div>
        </Dropdown>
      </div>
    </a>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default NotificationItem;
