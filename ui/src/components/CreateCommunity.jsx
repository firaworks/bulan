import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { communityAboutMaxLength, communityNameMaxLength } from '../config';
import { mfetch } from '../helper';
import { useInputUsername } from '../hooks';
import { sidebarCommunitiesUpdated, snackAlertError } from '../slices/mainSlice';
import { ButtonClose } from './Button';
import { FormField } from './Form';
import { InputWithCount, useInputMaxLength } from './Input';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

const CreateCommunity = ({ open, onClose }) => {
  const [name, handleNameChange] = useInputUsername(communityNameMaxLength);
  const [description, handleDescChange] = useInputMaxLength(communityAboutMaxLength);
  const [t, i18n] = useTranslation("global");
  const communities = useSelector((state) => state.main.sidebarCommunities);
  const dispatch = useDispatch();

  const history = useHistory();

  const [formError, setFormError] = useState('');

  const handleCreate = async () => {
    if (name.length < 3) {
      alert(t("create_community.alert_1"));
      return;
    }
    try {
      const res = await mfetch('/api/communities', {
        method: 'POST',
        body: JSON.stringify({ name, about: description }),
      });
      if (res.ok) {
        const community = await res.json();
        dispatch(sidebarCommunitiesUpdated([...communities, community]));
        onClose();
        history.push(`/${name}`);
      } else if (res.status === 409) {
        setFormError(t("create_community.alert_2"));
      } else {
        const error = await res.json();
        if (error.code === 'not_enough_points') {
          setFormError(
            t("create_community.alert_3") + 
            ` ${import.meta.env.VITE_FORUMCREATIONREQPOINTS} ` + t("create_community.alert_4")
          );
        } else if (error.code === 'max_limit_reached') {
          setFormError(
            t("create_community.alert_5")
          );
        } else {
          throw new Error(JSON.stringify(error));
        }
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-card modal-form modal-create-comm">
        <div className="modal-card-head">
          <div className="modal-card-title">{t("create_community.title")}</div>
          <ButtonClose onClick={onClose} />
        </div>
        <div className="form modal-card-content flex-column inner-gap-1">
          <FormField label={t("create_community.name_label")} description={t("create_community.name_description")}>
            <InputWithCount
              value={name}
              onChange={handleNameChange}
              maxLength={communityNameMaxLength}
              style={{ marginBottom: '0' }}
              autoFocus
            />
          </FormField>
          <FormField
            label={t("create_community.description_label")}
            description={t("create_community.description_description")}
          >
            <InputWithCount
              value={description}
              onChange={handleDescChange}
              textarea
              rows="4"
              maxLength={communityAboutMaxLength}
            />
          </FormField>
          {formError !== '' && (
            <div className="form-field">
              <div className="form-error text-center">{formError}</div>
            </div>
          )}
          <FormField>
            <button onClick={handleCreate} className="button-main" style={{ width: '100%' }}>
              {t("create")}
            </button>
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

CreateCommunity.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateCommunity;
