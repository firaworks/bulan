import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ButtonClose } from '../../components/Button';
import { FormField } from '../../components/Form';
import { InputPassword } from '../../components/Input';
import Modal from '../../components/Modal';
import { APIError, mfetch } from '../../helper';
import { snackAlert, snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const ChangePassword = () => {
  const [t, i18n] = useTranslation("global");
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  useEffect(() => {
    setPassword('');
    setNewPassword('');
    setRepeatPassword('');
  }, [open]);

  const dispatch = useDispatch();
  const changePassword = async () => {
    if (newPassword !== repeatPassword) {
      alert(t("settings.change_password.alert_1"));
      return;
    }
    if (newPassword.length < 8) {
      alert(t("settings.change_password.alert_2"));
      return;
    }
    try {
      const res = await mfetch('/api/_settings?action=changePassword', {
        method: 'POST',
        body: JSON.stringify({
          password,
          newPassword,
          repeatPassword,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          alert(t("settings.change_password.alert_3"));
          return;
        }
        throw new APIError(res.status, await res.json());
      } else {
        dispatch(snackAlert(t("settings.change_password.alert_4")));
        setOpen(false);
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ alignSelf: 'flex-start' }}>
        {t("settings.change_password.change_password")}
      </button>
      <Modal open={open} onClose={handleClose}>
        <div className="modal-card modal-change-password">
          <div className="modal-card-head">
            <div className="modal-card-title">{t("settings.change_password.change_password")}</div>
            <ButtonClose onClick={handleClose} />
          </div>
          <div
            className="form modal-card-content"
            onKeyDown={(e) => e.key === 'Enter' && changePassword()}
            role="none"
          >
            <FormField label="Previous password">
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </FormField>
            <FormField label="New password">
              <InputPassword value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </FormField>
            <FormField label="Repeat password">
              <InputPassword
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </FormField>
          </div>
          <div className="modal-card-actions">
            <button className="button-main" onClick={changePassword}>
              {t("settings.change_password.change_password")}
            </button>
            <button onClick={handleClose}>{t("cancel")}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChangePassword;
