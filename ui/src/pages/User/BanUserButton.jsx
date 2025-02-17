import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ButtonClose } from '../../components/Button';
import { FormField } from '../../components/Form';
import Input, { Checkbox } from '../../components/Input';
import Modal from '../../components/Modal';
import { mfetch } from '../../helper';
import { snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const BanUserButton = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [t, i18n] = useTranslation("global");
  const [deleteContentChecked, setDeleteContentChecked] = useState(false);
  const [page, setPage] = useState(1);
  const [banInProgress, setBanInProgress] = useState(false);
  useEffect(() => {
    setPage(1);
    setBanInProgress(false);
  }, [open]);
  const [confirmText, setConfirmText] = useState('');

  const handleClose = () => {
    if (!banInProgress) {
      setOpen(false);
    }
  };

  const dispatch = useDispatch();
  const handleBanUser = async () => {
    if (deleteContentChecked) {
      if (page !== 2) {
        setPage(2);
        return;
      }
      if (confirmText.toLowerCase() !== user.username.toLowerCase()) {
        alert(t("user.ban.alert_1"));
        return;
      }
    } else {
      if (!window.confirm(t('confirm'))) return;
    }
    try {
      setBanInProgress(true);
      const body = {
        action: user.isBanned ? 'unban_user' : 'ban_user',
        username: user.username,
      };
      if (body.action === 'ban_user' && deleteContentChecked) {
        body.deleteContentDays = 0;
      }
      const res = await mfetch(`/api/_admin`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        alert(`${t("user.ban.alert_2")} ${user.isBanned ? 'un' : ''}${t("user.ban.alert_3")}`);
        window.location.reload();
      } else {
        alert(t("user.ban.alert_4") + (await res.text()));
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      setBanInProgress(false);
    }
  };

  const handleButtonClick = () => {
    if (user.isBanned) {
      handleBanUser();
    } else {
      setOpen(true);
    }
  };

  const renderModalContent = () => {
    if (page === 1) {
      return (
        <div className="form modal-card-content">
          <FormField>
            <Checkbox
              label={t("user.ban.label_1")}
              checked={deleteContentChecked}
              onChange={(e) => setDeleteContentChecked(e.target.checked)}
            />
          </FormField>
        </div>
      );
    } else {
      return (
        <div className="form modal-card-content">
          <div className="form-field">
            <p>{t("user.ban.input_1")} </p>
          </div>
          <FormField>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </FormField>
        </div>
      );
    }
  };

  const modalTitle = user.isBanned ? t('user.ban.title_1') : t("user.ban.title_2");

  return (
    <>
      <button className="button-red" onClick={handleButtonClick}>
        {modalTitle}
      </button>
      <Modal open={open} onClose={handleClose}>
        <div className="modal-card is-compact-mobile is-desktop-style">
          <div className="modal-card-head">
            <div className="modal-card-title">{modalTitle}</div>
            <ButtonClose onClick={handleClose} />
          </div>
          {renderModalContent()}
          <div className="modal-card-actions">
            <button className="button-red" onClick={handleBanUser} disabled={banInProgress}>
              {modalTitle}
            </button>
            <button onClick={handleClose}>{t("cancel")}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BanUserButton.propTypes = {
  user: PropTypes.object.isRequired,
};

export default BanUserButton;
