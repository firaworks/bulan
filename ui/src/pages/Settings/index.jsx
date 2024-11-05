import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import {
  getNotificationsPermissions,
  shouldAskForNotificationsPermissions,
} from '../../PushNotifications';
import { ButtonUpload } from '../../components/Button';
import CommunityProPic from '../../components/CommunityProPic';
import Dropdown from '../../components/Dropdown';
import { FormField, FormSection } from '../../components/Form';
import Input, { Checkbox } from '../../components/Input';
import CommunityLink from '../../components/PostCard/CommunityLink';
import { APIError, mfetch, mfetchjson, validEmail } from '../../helper';
import { useIsChanged } from '../../hooks';
import {
  mutesAdded,
  settingsChanged,
  snackAlert,
  snackAlertError,
  unmuteCommunity,
  unmuteUser,
  userLoggedIn,
} from '../../slices/mainSlice';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import { getDevicePreference, setDevicePreference } from './devicePrefs';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;
  const [t, i18n] = useTranslation("global");
  const mutes = useSelector((state) => state.main.mutes);
  const [aboutMe, setAboutMe] = useState(user.aboutMe || '');
  const [email, setEmail] = useState(user.email || '');

  const [notifsSettings, _setNotifsSettings] = useState({
    upvoteNotifs: !user.upvoteNotificationsOff,
    replyNotifs: !user.replyNotificationsOff,
  });
  const setNotifsSettings = (key, val) => {
    _setNotifsSettings((prev) => {
      return {
        ...prev,
        [key]: val,
      };
    });
  };

  const homeFeedOptions = {
    all: t('settings.home_feed_selections.all'),
    subscriptions: t('settings.home_feed_selections.subscriptions'),
  };
  const [homeFeed, setHomeFeed] = useState(user.homeFeed);

  const [rememberFeedSort, setRememberFeedSort] = useState(user.rememberFeedSort);
  const [enableEmbeds, setEnableEmbeds] = useState(!user.embedsOff);
  const [showUserProfilePictures, setShowUserProfilePictures] = useState(
    !user.hideUserProfilePictures
  );

  // Per-device preferences:
  const [font, setFont] = useState(getDevicePreference('font') ?? 'custom');
  const fontOptions = {
    custom: 'Custom', // value -> display name
    system: 'System',
  };

  const [changed, resetChanged] = useIsChanged([
    aboutMe /*, email*/,
    notifsSettings,
    homeFeed,
    rememberFeedSort,
    enableEmbeds,
    email,
    showUserProfilePictures,
    font,
  ]);

  const applicationServerKey = useSelector((state) => state.main.vapidPublicKey);
  const [notificationsPermissions, setNotificationsPermissions] = useState(
    window.Notification && Notification.permission
  );
  useEffect(() => {
    let cleanupFunc,
      cancelled = false;
    const f = async () => {
      if ('permissions' in navigator) {
        const status = await navigator.permissions.query({ name: 'notifications' });
        const listener = () => {
          if (!cancelled) {
            setNotificationsPermissions(status.state);
          }
        };
        status.addEventListener('change', listener);
        cleanupFunc = () => status.removeEventListener('change', listener);
      }
    };
    f();
    return () => {
      cancelled = true;
      if (cleanupFunc) cleanupFunc();
    };
  }, []);
  const [canEnableWebPushNotifications, setCanEnableWebPushNotifications] = useState(
    shouldAskForNotificationsPermissions(loggedIn, applicationServerKey, false)
  );
  useEffect(() => {
    setCanEnableWebPushNotifications(
      shouldAskForNotificationsPermissions(loggedIn, applicationServerKey, false)
    );
  }, [notificationsPermissions]);

  const handleEnablePushNotifications = async () => {
    await getNotificationsPermissions(loggedIn, applicationServerKey);
  };

  const handleDisablePushNotifications = () => { };

  const handleSave = async () => {
    if (email !== '' && !validEmail(email)) {
      dispatch(snackAlert(t("settings.index.alert_1")));
      return;
    }
    // Save device preferences first:
    setDevicePreference('font', font);
    try {
      const ruser = await mfetchjson(`/api/_settings?action=updateProfile`, {
        method: 'POST',
        body: JSON.stringify({
          aboutMe,
          upvoteNotificationsOff: !notifsSettings.upvoteNotifs,
          replyNotificationsOff: !notifsSettings.replyNotifs,
          homeFeed,
          rememberFeedSort,
          embedsOff: !enableEmbeds,
          email,
          hideUserProfilePictures: !showUserProfilePictures,
        }),
      });
      dispatch(userLoggedIn(ruser));
      dispatch(snackAlert(t("settings.index.alert_2"), 'settings_saved'));
      resetChanged();
      dispatch(settingsChanged());
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const proPicAPIEndpoint = `/api/users/${user.username}/pro_pic`;
  const [isProPicUploading, setIsProPicUploading] = useState(false);
  const handleProPicUpload = async (files) => {
    if (isProPicUploading) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', files[0]);
      setIsProPicUploading(true);
      const res = await mfetch(proPicAPIEndpoint, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          if (error.code === 'file_size_exceeded') {
            dispatch(snackAlert(t("settings.index.alert_3")));
            return;
          } else if (error.code === 'unsupported_image') {
            dispatch(snackAlert(t("settings.index.alert_4")));
            return;
          }
          throw new APIError(res.status, await res.json());
        }
      }
      const ruser = await res.json();
      dispatch(userLoggedIn(ruser));
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      setIsProPicUploading(false);
    }
  };
  const handleProPicDelete = async () => {
    if (isProPicUploading) {
      return;
    }
    try {
      const ruser = await mfetchjson(proPicAPIEndpoint, { method: 'DELETE' });
      dispatch(userLoggedIn(ruser));
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      setIsProPicUploading(false);
    }
  };

  const handleUnmute = async (mute) => {
    // try {
    //   await mfetchjson(`/api/mutes/${mute.id}`, {
    //     method: 'DELETE',
    //   });
    //   setMutes((mutes) => {
    //     let array, fieldName;
    //     if (mute.type === 'community') {
    //       array = mutes.communityMutes;
    //       fieldName = 'communityMutes';
    //     } else {
    //       array = mutes.userMutes;
    //       fieldName = 'userMutes';
    //     }
    //     array = array.filter((m) => m.id !== mute.id);
    //     return {
    //       ...mutes,
    //       [fieldName]: array,
    //     };
    //   });
    // } catch (error) {
    //   dispatch(snackAlertError(error));
    // }
    if (mute.type === 'community') {
      const community = mute.mutedCommunity;
      dispatch(unmuteCommunity(community.id, community.name));
    } else {
      const user = mute.mutedUser;
      dispatch(unmuteUser(user.id, user.username));
    }
  };

  const handleUnmuteAll = async (type = '') => {
    try {
      await mfetchjson(`/api/mutes?type=${type}`, {
        method: 'DELETE',
      });
      // setMutes((mutes) => {
      //   const fieldName = type === 'community' ? 'communityMutes' : 'userMutes';
      //   return {
      //     ...mutes,
      //     [fieldName]: [],
      //   };
      // });
      const newMutes = {
        ...mutes,
      };
      newMutes[`${type}Mutes`] = [];
      dispatch(mutesAdded(newMutes));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const renderMute = (mute) => {
    if (mute.type === 'community') {
      const community = mute.mutedCommunity;
      return (
        <div className="mute-list-item">
          <CommunityLink name={community.name} proPic={community.proPic} />
          <button onClick={() => handleUnmute(mute)}>Unmute</button>
        </div>
      );
    }
    if (mute.type === 'user') {
      const user = mute.mutedUser;
      return (
        <div>
          <Link to={`/@${user.username}`}>@{user.username}</Link>
          <button onClick={() => handleUnmute(mute)}>Unmute</button>
        </div>
      );
    }
    return 'Unkonwn muting type.';
  };

  return (
    <div className="page-content wrap page-settings">
      <Helmet>
        <title>{t('settings.settings')}</title>
      </Helmet>
      <div className="form account-settings card">
        <h1>{t("settings.account_settings")}</h1>
        <FormSection>
          <FormSection>
            <div className="settings-propic">
              <CommunityProPic name={user.username} proPic={user.proPic} size="standard" />
              <ButtonUpload onChange={handleProPicUpload} disabled={isProPicUploading}>
                {t('change')}
              </ButtonUpload>
              <button onClick={handleProPicDelete} disabled={isProPicUploading}>
                {t('del')}
              </button>
            </div>
          </FormSection>
          <FormField label={t("settings.username")} description={t("settings.description_1")}>
            <Input value={user.username || ''} disabled />
          </FormField>
          <FormField label={t("settings.label_2")}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label={t("settings.label_3")}>
            <textarea
              rows="5"
              placeholder={t("settings.placeholder_1")}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
            />
          </FormField>
          <FormField>
            <ChangePassword />
          </FormField>
          <FormField>
            <DeleteAccount user={user} />
          </FormField>
        </FormSection>
        <FormSection heading={t("settings.label_4")}>
          <FormField className="is-preference" label={t('settings.home_feed')}>
            <Dropdown
              aligned="right"
              target={<button className="select-bar-dp-target">{homeFeedOptions[homeFeed]}</button>}
            >
              <div className="dropdown-list">
                {Object.keys(homeFeedOptions)
                  .filter((key) => key != homeFeed)
                  .map((key) => (
                    <div key={key} className="dropdown-item" onClick={() => setHomeFeed(key)}>
                      {homeFeedOptions[key]}
                    </div>
                  ))}
              </div>
            </Dropdown>
          </FormField>
          <FormField className="is-preference is-switch">
            <Checkbox
              variant="switch"
              label={t("settings.placeholder_2")}
              checked={rememberFeedSort}
              onChange={(e) => setRememberFeedSort(e.target.checked)}
            />
          </FormField>
          {/* <FormField className="is-preference is-switch">
            <Checkbox
              label={t("settings.label_5")}
              variant="switch"
              checked={enableEmbeds}
              onChange={(e) => setEnableEmbeds(e.target.checked)}
            />
          </FormField> */}
          <FormField className="is-preference is-switch">
            <Checkbox
              variant="switch"
              label={t("settings.label_6")}
              checked={showUserProfilePictures}
              onChange={(e) => setShowUserProfilePictures(e.target.checked)}
            />
          </FormField>
        </FormSection>
        {/* <FormSection heading={t("settings.heading_1")}>
          <FormField className="is-preference" label="Font">
            <Dropdown
              aligned="right"
              target={<button className="select-bar-dp-target">{fontOptions[font]}</button>}
            >
              <div className="dropdown-list">
                {Object.keys(fontOptions).map((key) => (
                  <div key={key} className="dropdown-item" onClick={() => setFont(key)}>
                    {fontOptions[key]}
                  </div>
                ))}
              </div>
            </Dropdown>
          </FormField>
        </FormSection> */}
        <FormSection heading={t("settings.heading_2")}>
          <FormField className="is-preference is-switch">
            <Checkbox
              variant="switch"
              label={t("settings.label_7")}
              checked={notifsSettings.upvoteNotifs}
              onChange={(e) => setNotifsSettings('upvoteNotifs', e.target.checked)}
            />
          </FormField>
          <FormField className="is-preference is-switch">
            <Checkbox
              variant="switch"
              label={t("settings.label_8")}
              checked={notifsSettings.replyNotifs}
              onChange={(e) => setNotifsSettings('replyNotifs', e.target.checked)}
            />
          </FormField>
          {canEnableWebPushNotifications && (
            <FormField>
              <button onClick={handleEnablePushNotifications} style={{ alignSelf: 'flex-start' }}>
                {t("settings.text_1")}
              </button>
            </FormField>
          )}
        </FormSection>
        <FormSection heading={t("settings.heading_3")}>
          <div className="mutes-list">
            {mutes.communityMutes.length === 0 && <div>{t("none")}</div>}
            {mutes.communityMutes.map((mute) => renderMute(mute))}
            {mutes.communityMutes.length > 0 && (
              <button
                style={{ alignSelf: 'flex-end' }}
                onClick={() => handleUnmuteAll('community')}
              >
                {t("unmute_all")}
              </button>
            )}
          </div>
        </FormSection>
        <FormSection heading={t("settings.heading_4")}>
          <div className="mutes-list">
            {mutes.userMutes.length === 0 && <div>{t("none")}</div>}
            {mutes.userMutes.map((mute) => renderMute(mute))}
            {mutes.userMutes.length > 0 && (
              <button style={{ alignSelf: 'flex-end' }} onClick={() => handleUnmuteAll('user')}>
                {t("unmute_all")}
              </button>
            )}
          </div>
        </FormSection>
        <FormField>
          <button
            className="button-main"
            disabled={!changed}
            onClick={handleSave}
            style={{ width: '100%' }}
          >
            {t("save")}
          </button>
        </FormField>
      </div>
    </div>
  );
};

export default Settings;
