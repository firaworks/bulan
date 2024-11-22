import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { usernameMaxLength } from '../config';
import { APIError, mfetch, validEmail } from '../helper';
import { useDelayedEffect, useInputUsername } from '../hooks';
import { loginModalOpened, snackAlert, snackAlertError } from '../slices/mainSlice';
import { ButtonClose } from './Button';
import { Form, FormField } from './Form';
import Input, { InputPassword, InputWithCount } from './Input';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

const HttpStatusConflict = 409

const Signup = ({ open, onClose }) => {
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
  const signupsDisabled = useSelector((state) => state.main.signupsDisabled);

  const [username, handleUsernameChange] = useInputUsername(usernameMaxLength);
  const [usernameError, setUsernameError] = useState(null);
  const checkUsernameExists = useCallback(async () => {
    if (username === '') return true;
    try {
      const res = await mfetch(`/api/users/${username}`);
      if (!res.ok) {
        if (res.status === 404) {
          setUsernameError(null);
          return false;
        }
        throw new APIError(res.status, await res.json());
      }
      setUsernameError(`${username} ` + t("signup.username_error"));
      return true;
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  }, [dispatch, username]);
  useDelayedEffect(checkUsernameExists);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  // useEffect(() => {
  //   setEmailError(null);
  // }, [email]);
  const checkEmailExists = useCallback(async () => {
    if (email === '') return true;
    if (validEmail(email)) {
      try {
        const res = await mfetch(`/api/useremail/${email}`);
        if (!res.ok) {
          throw new APIError(res.status, await res.json());
        }
        const body = await res.json()
        if (body.ef == true) {
          setEmailError(`${email} ` + t("signup.email_exists"));
          return true;
        } else {
          setEmailError(null);
          return false;
        }
      } catch (error) {
        dispatch(snackAlertError(error));
      }
    }
  }, [dispatch, email]);
  useDelayedEffect(checkEmailExists);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  useEffect(() => {
    setPasswordError(null);
  }, [password]);

  const [repeatPassword, setRepeatPassword] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState(null);
  useEffect(() => {
    setRepeatPasswordError(null);
  }, [repeatPassword]);

  const CAPTCHA_ENABLED = import.meta.env.VITE_CAPTCHASITEKEY ? true : false;
  const captchaRef = useRef();
  const handleCaptchaVerify = (token) => {
    if (!token) {
      dispatch(snackAlert(t("signup.generic_error")));
      return;
    }
    signInUser(username, email, password, token);
  };
  const signInUser = async (username, email, password, captchaToken) => {
    try {
      const res = await mfetch('/api/_signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, captchaToken }),
      });
      if (!res.ok) {
        if (res.status == HttpStatusConflict) {
          let body = await res.json()
          if (body.code != null && body.code == 'email_exists') {
            setEmailError(t('signup.email_exists'))
            throw new APIError(res.status, await res.json());
          }
        } else {
          throw new APIError(res.status, await res.json());
        }
      }
      window.location.reload();
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
    if (!username) {
      errFound = true;
      setUsernameError(t('username_cannot_be_empty'));
    } else if (username.length < 4) {
      errFound = true;
      setUsernameError(errors[2]);
    } else if ((await checkUsernameExists()) === true) {
      errFound = true;
    }
    if (!password) {
      errFound = true;
      setPasswordError(errors[1]);
    } else if (password.length < 8) {
      errFound = true;
      setPasswordError(errors[4]);
    }
    if (!repeatPassword) {
      errFound = true;
      setRepeatPasswordError(errors[5]);
    } else if (password !== repeatPassword) {
      errFound = true;
      setRepeatPasswordError(errors[6]);
    }
    if (!email) {
      errFound = true;
      setEmailError(t('email_cannot_be_empty'));
    } else {
      if (!validEmail(email)) {
        errFound = true;
        setEmailError(t('signup.email_invalid'));
      }
    }
    if (errFound) {
      return;
    }
    if (!CAPTCHA_ENABLED) {
      signInUser(username, email, password);
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
        <div className={clsx('modal-card modal-signup', signupsDisabled && 'is-disabled')}>
          <div className="modal-card-head">
            <div className="modal-card-title">{t("signup.signup")}</div>
            <ButtonClose onClick={onClose} />
          </div>
          <Form className="modal-card-content" onSubmit={handleSubmit}>
            {signupsDisabled && (
              <div className="modal-signup-disabled">{t('signup.signups_disabled')}</div>
            )}
            <FormField
              className="is-username"
              label={t("signup.username_label")}
              description={t("signup.username_description")}
              error={usernameError}
            >
              <InputWithCount
                maxLength={usernameMaxLength}
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => checkUsernameExists()}
                autoFocus
                autoComplete="username"
                disabled={signupsDisabled}
              />
            </FormField>
            <FormField
              label={t("signup.email_label")}
              description={t("signup.email_description")}
              error={emailError}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signupsDisabled}
              />
            </FormField>
            <FormField label={t("login_view.label_2")} error={passwordError}>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={signupsDisabled}
              />
            </FormField>
            <FormField label={t("login_view.repeat_password")} error={repeatPasswordError}>
              <InputPassword
                value={repeatPassword}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                }}
                autoComplete="new-password"
                disabled={signupsDisabled}
              />
            </FormField>
            {CAPTCHA_ENABLED && (
              <div style={{ margin: 0 }}>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_CAPTCHASITEKEY}
                  onChange={handleCaptchaVerify}
                  size="invisible"
                  onError={handleCaptchaError}
                />
              </div>
            )}
            <FormField>
              <p className="modal-signup-terms">
                {t("signup.creation_description_1")}
                <a target="_blank" href="/terms">
                  {" " + t("signup.terms")}
                </a>
                {" " + t("signup.and")}
                <a target="_blank" href="/privacy-policy">
                  {" " + t("signup.privacy_policy")}
                </a>
                .
              </p>
              <p className="modal-signup-terms is-captcha">
                {t("signup.captcha_text")}{' '}
                <a href="https://policies.google.com/privacy-policy" target="_blank">
                  {t("signup.privacy_policy")}
                </a>{' '}
                {t("signup.and")}{' '}
                <a href="https://policies.google.com/terms" target="_blank">
                  {t("signup.terms_of_service")}
                </a>{' '}
                {t("signup.apply")}
              </p>
            </FormField>
            <FormField className="is-submit">
              <input type="submit" className="button button-main" value={t("auth.signup")} />
              <button className="button-link" onClick={handleOnLogin} disabled={signupsDisabled}>
                {t("signup.login")}
              </button>
            </FormField>
          </Form>
        </div>
      </Modal>
    </>
  );
};

Signup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Signup;
