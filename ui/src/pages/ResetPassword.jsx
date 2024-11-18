import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PageLoading from '../components/PageLoading';
import PasswordReset from '../components/PasswordReset';

const ResetPassword = () => {
  const { token } = useParams();
  const [t, i18n] = useTranslation("global");
  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const handleSuccess = () => { };

  if (loggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <div className="page-content page-login wrap">
      <div className="card login-card">
        <div className="title">{t('reset_new_password')}</div>
        <PasswordReset onSucces={handleSuccess} token={token} />
      </div>
    </div>
  );
};

export default ResetPassword;
