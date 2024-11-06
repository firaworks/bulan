import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ButtonClose } from '../../components/Button';
import { FormField } from '../../components/Form';
import Input, { InputPassword } from '../../components/Input';
import Modal from '../../components/Modal';
import { APIError, mfetch } from '../../helper';
import { snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const DeleteAccount = ({ user }) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const [confirm, setConfirm] = useState('');
  const [password, _setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const setPassword = (pass) => {
    _setPassword(pass);
    setPasswordError(false);
  };
  const handleOnDelete = async () => {
    try {
      const res = await mfetch(`/api/users/${user.username}`, {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          setPasswordError(true);
          return;
        }
        throw new APIError(res.status, await res.json());
      }
      alert(t("settings.delete_account.alert_1"));
      // Send the user to the home page.
      window.location.href = window.location.origin;
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  return (
    <>
      <button className="button-red" onClick={() => setOpen(true)}>
        {t('settings.delete_account.delete_account')}
      </button>
      <Modal open={open} onClose={handleClose}>
        <div className="modal-card">
          <div className="modal-card-head">
            <div className="modal-card-title">{t("settings.delete_account.delete_account")}</div>
            <ButtonClose onClick={handleClose} />
          </div>
          <div className="form modal-card-content">
            <div className="form-field">
              <p>{t("settings.delete_account.alert_2")}</p>
            </div>
            <FormField label={t("settings.delete_account.password")} error={passwordError ? t("settings.delete_account.invald_pass") : undefined}>
              <InputPassword value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <FormField label={t("settings.delete_account.type_to_continue")}>
              <Input type="text" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </FormField>
          </div>
          <div className="modal-card-actions">
            <button className="button-red" onClick={handleOnDelete} disabled={confirm !== 'YES'}>
              {t('_delete')}
            </button>
            <button onClick={handleClose}>{t("cancel")}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

DeleteAccount.propTypes = {
  user: PropTypes.object,
};

export default DeleteAccount;
