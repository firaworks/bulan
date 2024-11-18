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

const PasswordReset = ({ open, onClose, token }) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  useEffect(() => {
    setPassword('')
    setPasswordRepeat('')
  }, []);
  const CAPTCHA_ENABLED = import.meta.env.VITE_CAPTCHASITEKEY ? true : false;
  const captchaRef = useRef();

  const resetPassword = async () => {
    if (password !== passwordRepeat) {
      alert(t("settings.change_password.alert_1"));
      return;
    }
    if (password.length < 8) {
      alert(t("settings.change_password.alert_2"));
      return;
    }
    try {
      const res = await mfetch('/api/_pw_reset', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
          passwordRepeat,
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
        alert(t("settings.change_password.alert_4"))
        let loginPage = `//${window.location.host}/login`
        window.location.replace(loginPage)
      }
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
      resetPassword();
      return;
    }
    if (!captchaRef.current) {
      dispatch(snackAlertError(new Error(t("signup.captcha_error"))));
      return;
    }
    captchaRef.current.execute();
  };

  const handleOnReset = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <>
      <Helmet>
        <style>{`.grecaptcha-badge { visibility: hidden; }`}</style>
      </Helmet>
      <Form className="modal-card-content" onSubmit={handleSubmit}>
        <div
          className="form modal-card-content"
          onKeyDown={(e) => e.key === 'Enter' && resetPassword()}
          role="none"
        >
          <Input type='hidden' name='token' value={token}></Input>
          <FormField label={t("auth.new_password")} >
            <InputPassword value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <FormField label={t("login_view.repeat_password")} >
            <InputPassword value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} />
          </FormField>

          <FormField className="is-submit">
            <input type="submit" className="button button-main" value={t('change')} />
          </FormField>
        </div>
      </Form>
    </>
  );
};

PasswordReset.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PasswordReset;
