import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CommunityProPic from '../../components/CommunityProPic';
import { FormField } from '../../components/Form';
import Input, { Checkbox, InputWithCount, useInputMaxLength } from '../../components/Input';
import { mfetch, mfetchjson } from '../../helper';
import { communityAdded } from '../../slices/communitiesSlice';
import { snackAlert, snackAlertError } from '../../slices/mainSlice';
import Banner from '../Community/Banner';
import { useTranslation } from 'react-i18next';

const descriptionMaxLength = 2000;

const Settings = ({ community }) => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();

  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const [_changed, setChanged] = useState(-1);

  const [description, setDescription] = useInputMaxLength(
    descriptionMaxLength,
    community.about || ''
  );
  const [nsfw, setNSFW] = useState(community.nsfw);

  const handleSave = async () => {
    try {
      const rcomm = await mfetchjson(`/api/communities/${community.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...community,
          nsfw,
          about: description,
        }),
      });
      dispatch(communityAdded(rcomm));
      dispatch(snackAlert(t("mod.settings.alert_1")));
      setChanged(-1);
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const changed = _changed > 0;
  useEffect(() => {
    setChanged((c) => c + 1);
  }, [description, nsfw]);

  const proPicFileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const updloadImage = async (file, url) => {
    if (isUploading) return;
    try {
      const data = new FormData();
      data.append('image', file);
      setIsUploading(true);
      const res = await mfetch(url, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          if (error.code === 'file_size_exceeded') {
            dispatch(snackAlert(t("mod.settings.alert_2")));
            return;
          } else if (error.code === 'unsupported_image') {
            dispatch(snackAlert(t("mod.settings.alert_3")));
            return;
          }
        }
        throw new APIError(res.status, await res.json());
      }
      const rcomm = await res.json();
      dispatch(communityAdded(rcomm));
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      setIsUploading(false);
    }
  };
  const handleProPicFileChange = () => {
    updloadImage(proPicFileInputRef.current.files[0], `/api/communities/${community.id}/pro_pic`);
  };
  const handleBannerFileChange = () => {
    updloadImage(
      bannerFileInputRef.current.files[0],
      `/api/communities/${community.id}/banner_image`
    );
  };

  const handleDeleteProPic = async () => {
    try {
      const rcomm = await mfetchjson(`/api/communities/${community.id}/pro_pic`, {
        method: 'DELETE',
      });
      dispatch(communityAdded(rcomm));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const handleDeleteBannerImage = async () => {
    try {
      const rcomm = await mfetchjson(`/api/communities/${community.id}/banner_image`, {
        method: 'DELETE',
      });
      dispatch(communityAdded(rcomm));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const handleChangeDefault = async () => {
    try {
      const res = await mfetchjson(`/api/_admin`, {
        method: 'POST',
        body: JSON.stringify({
          action: community.isDefault ? 'remove_default_forum' : 'add_default_forum',
          name: community.name,
        }),
      });
      dispatch(
        communityAdded({
          ...community,
          isDefault: !community.isDefault,
        })
      );
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  return (
    <div className="modtools-content modtools-settings">
      <div className="modtools-content-head">
        <div className="modtools-title">Community settings</div>
      </div>
      {/*<div className="flex-column inner-gap-1">*/}
      <div className="form">
        <FormField label="Community name">
          <Input value={community.name} disabled />
        </FormField>
        <FormField label={t("mod.settings.label_1")}>
          <div className=" modtools-change-propic">
            <div className="flex">
              <CommunityProPic name={community.name} proPic={community.proPic} size="standard" />
              <button onClick={() => proPicFileInputRef.current.click()} disabled={isUploading}>
                {t("change")}
              </button>
              <button onClick={handleDeleteProPic} disabled={isUploading}>
                {t('_delete')}
              </button>
              <input
                ref={proPicFileInputRef}
                type="file"
                name="image"
                style={{ visibility: 'hidden', width: 0, height: 0 }}
                onChange={handleProPicFileChange}
              />
            </div>
          </div>
        </FormField>
        <div className="form-field modtools-change-banner">
          <div className="label">{t("mod.settings.label_2")}</div>
          <div className="flex flex-column">
            <Banner className="modtools-banner" community={community} />
            <div className="flex modtools-change-banner-buttons">
              <button onClick={() => bannerFileInputRef.current.click()} disabled={isUploading}>
                {t("change")}
              </button>
              <button onClick={handleDeleteBannerImage} disabled={isUploading}>
                {t('_delete')}
              </button>
            </div>
            <input
              ref={bannerFileInputRef}
              type="file"
              name="image"
              style={{ visibility: 'hidden', width: 0, height: 0 }}
              onChange={handleBannerFileChange}
            />
          </div>
        </div>
        <FormField
          label={t("mod.settings.label_3")}
          description={t("mod.settings.description_1")}
        >
          <InputWithCount
            textarea
            rows="5"
            maxLength={descriptionMaxLength}
            value={description}
            onChange={setDescription}
          />
        </FormField>
        <FormField label="NSFW">
          <Checkbox
            variant="switch"
            label={t("mod.settings.label_4")}
            checked={nsfw}
            onChange={(e) => setNSFW(e.target.checked)}
            spaceBetween
          />
        </FormField>
        {user.isAdmin && (
          <FormField>
            <button onClick={handleChangeDefault}>
              {community.isDefault ? t("mod.settings.default_1") : t('mod.settings.default_2')}
            </button>
          </FormField>
        )}
        <FormField>
          <button
            className="button-main"
            onClick={handleSave}
            disabled={!changed}
            style={{ width: '100%' }}
          >
            {t("save")} {changed}
          </button>
        </FormField>
      </div>
    </div>
  );
};

Settings.propTypes = {
  community: PropTypes.object.isRequired,
};

export default Settings;
