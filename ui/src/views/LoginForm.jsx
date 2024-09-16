import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Form, FormField } from '../components/Form';
import Input, { InputPassword } from '../components/Input';
import { APIError, mfetch } from '../helper';
import { loginModalOpened, signupModalOpened, snackAlertError } from '../slices/mainSlice';
import { useTranslation } from 'react-i18next'; 


const LoginForm = ({ isModal = false }) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  useEffect(() => {
    setLoginError(null);
  }, [username, password]);
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (username === '' && password === '') {
      setLoginError(t("login_view.alert_1"));
      return;
    } else if (username === '') {
      setLoginError(t("login_view.alert_2"));
      return;
    } else if (password === '') {
      setLoginError(t("login_view.alert_3"));
      return;
    }
    try {
      let res = await mfetch('/api/_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        if (res.status === 401) {
          setLoginError(t("login_view.alert_4"));
        } else if (res.status === 403) {
          const json = await res.json();
          if (json.code === 'account_suspended') {
            setLoginError(`@${username} ${t("login_view.alert_5")}`);
          } else {
            throw new APIError(res.status, json);
          }
        } else {
          throw new APIError(res.status, await res.json());
        }
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const usernameRef = useRef();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/login') {
      usernameRef.current.focus();
    }
  }, [pathname]);

  const handleOnSignup = (e) => {
    e.preventDefault();
    dispatch(loginModalOpened(false));
    dispatch(signupModalOpened());
  };

  return (
    <Form className="login-box modal-card-content" onSubmit={handleLoginSubmit}>
      <FormField label={t("login_view.label_1")}>
        <Input
          ref={usernameRef}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus={isModal}
          autoComplete="username"
        />
      </FormField>
      <FormField label={t("login_view.label_2")}>
        <InputPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </FormField>
      {loginError && (
        <FormField>
          <div className="form-error text-center">{loginError}</div>
        </FormField>
      )}
      <FormField className="is-submit">
        <input type="submit" className="button button-main" value="Login" />
        <button className="button-link" onClick={handleOnSignup}>
          {t("login_view.text_1")}
        </button>
      </FormField>
    </Form>
  );
};

LoginForm.propTypes = {
  isModal: PropTypes.bool,
};

export default LoginForm;
