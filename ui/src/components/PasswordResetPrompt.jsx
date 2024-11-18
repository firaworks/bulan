import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { usernameMaxLength } from '../config';
import { APIError, mfetch, validEmail } from '../helper';
import { snackAlert, snackAlertError } from '../slices/mainSlice';
import { ButtonClose } from './Button';
import { Form, FormField } from './Form';
import Input, { InputPassword, InputWithCount } from './Input';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

const PasswordResetPrompt = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");
  const errors = [
    t("list_alert_5"),
    t("login_view.alert_3"),
    t("auth.alert_1"),
    t("settings.index.alert_1"),
    t("auth.alert_2"),
    t("auth.alert_3"),
    t("login_view.alert_4"),
  ];
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  useEffect(() => {
    setUsernameError(null);
  }, [username]);

  const CAPTCHA_ENABLED = import.meta.env.VITE_CAPTCHASITEKEY ? true : false;
  const captchaRef = useRef();
  const handleCaptchaVerify = (token) => {
    if (!token) {
      dispatch(snackAlert(t("signup.generic_error")));
      return;
    }
    requestPwReset(username, token);
  };

  const requestPwReset = async (username, captchaToken) => {
    try {
      const res = await mfetch('/api/_pw_request_reset', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new APIError(res.status, await res.json());
      alert(t('sent_reset_mail'))
      window.location.reload()
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };
  const handleCaptchaError = (error) => {
    dispatch(snackAlertError(error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errFound = false;
    if (!CAPTCHA_ENABLED) {
      requestPwReset(username);
      return;
    }
    if (!captchaRef.current) {
      dispatch(snackAlertError(new Error(t("signup.captcha_error"))));
      return;
    }
    captchaRef.current.execute();
  };

  const handleOnLogin = (e) => {
    e.preventDefault();
    onClose();
    dispatch(loginModalOpened());
  };

  return (
    <>
      <Helmet>
        <style>{`.grecaptcha-badge { visibility: hidden; }`}</style>
      </Helmet>
      <Modal open={open} onClose={onClose} noOuterClickClose={false}>
        <div className="modal-card modal-signup">
          <div className="modal-card-head">
            <div className="modal-card-title">{t('reset_password')}</div>
            <ButtonClose onClick={onClose} />
          </div>
          <Form className="modal-card-content" onSubmit={handleSubmit}>
            <FormField
              label={t('username_or_email')}
              error={usernameError}
            >
              <Input type="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormField>

            <FormField className="is-submit">
              <input type="submit" className="button button-main" value={t('request_pw_reset')} />
              <button className="button-link" onClick={handleOnLogin}>
                {t("signup.login")}
              </button>
            </FormField>
          </Form>
        </div>
      </Modal>
    </>
  );
};

PasswordResetPrompt.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PasswordResetPrompt;
