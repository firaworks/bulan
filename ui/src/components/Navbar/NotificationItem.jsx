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
import { useTranslation } from "react-i18next";

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
            <>
              <b>@{notif.commentAuthor}</b>{ t("notifications.data.comment") }<b>{notif.post.title}</b>.
            </>
          );
        } else {
          return (
            <>
              {notif.noComments} { t("notifications.data.comments") } <b>{notif.post.title}</b>.
            </>
          );
        }
      }
      case 'comment_reply': {
        if (notif.noComments === 1) {
          return (
            <>
              <b>@{notif.commentAuthor}</b>{ t("notifications.data.reply")}{' '}
              <b>{notif.post.title}</b>.
            </>
          );
        } else {
          return (
            <>
              {notif.noComments} { t("notifications.data.replies")} <b>{notif.post.title}</b>.
            </>
          );
        }
      }
      case 'new_votes': {
        if (notif.targetType === 'post') {
          return (
            <>
              {stringCount(notif.noVotes, false, t("notifications.data.upvote"))} {t("notifications.data.on_your_post")}{' '}
              <b>{notif.post.title}</b>.
            </>
          );
        } else {
          return (
            <>
              {stringCount(notif.noVotes, false, t("notifications.data.vote"))} {t("notifications.data.on_your_comment_in")}{' '}
              <b>{`~${notif.post.title}`}</b>.
            </>
          );
        }
      }
      case 'deleted_post': {
        return (
          <>
            {t("notifications.data.deleted_post.your_post") } <b>{notif.post.title}</b>{t("notifications.data.deleted_post.has_been_removed_by") }{' '}
            {notif.deletedAs === 'mods' ? (
              <>
                {t("notifications.data.deleted_post.moderators_of") } <b>{notif.post.communityName}</b>
              </>
            ) : (
              'the admins'
            )}
            .
          </>
        );
      }
      case 'mod_add': {
        return (
          <>
            {t("notifications.data.mod_add_1") } <b>{notif.communityName}</b> { t("notifications.data.modd_add_2") } <b>@{notif.addedBy}.</b>
          </>
        );
      }
      case 'new_badge': {
        return (
          <>
            {t("notifications.data.new_badge_1") }<b>{t("notifications.data.new_badge_2")}</b>{t("notifications.data.new_badge_2") }
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
              {seen ? t("notifications.data.mark_seen") : t("notifications.data.mark_unseen")}
            </button>
            <button className="button-clear dropdown-item" onClick={handleDelete}>
              {t("notifications.data.delete_button")}
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
