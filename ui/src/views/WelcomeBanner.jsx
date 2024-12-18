import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { createCommunityModalOpened, signupModalOpened } from '../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const WelcomeBanner = ({ className, children, hideIfMember = false, ...props }) => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();

  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const usersCount = useSelector((state) => state.main.noUsers);

  if (hideIfMember && loggedIn) {
    return null;
  }

  const canCreateForum = loggedIn && (user.isAdmin || !import.meta.env.VITE_DISABLEFORUMCREATION);

  return (
    <div
      className={
        'card card-sub card-padding home-welcome' +
        (!loggedIn ? ' is-guest' : '') +
        (className ? ` ${className}` : '')
      }
      {...props}
    >
      <div className="home-welcome-text">
        <div className="home-welcome-join">{t('welcome.join')}</div>
        <div className="home-welcome-subtext">
          {t("welcome.description_1")} нийт {t("welcome.description_2")}
          {/* {t("welcome.description_1")} <span>{usersCount}</span> {t("welcome.description_2")} */}
        </div>
      </div>
      <div className="home-welcome-buttons">
        {loggedIn && (
          <Link to="/new" className={'button' + (loggedIn ? ' button-main' : '')}>
            {t("welcome.create_post")}
          </Link>
        )}
        {canCreateForum && (
          <>
            <button
              onClick={() => dispatch(createCommunityModalOpened())}
              className={'button' + (loggedIn ? ' button-main' : '')}
            >
              {t("welcome.create_community")}
            </button>
          </>
        )}
        <>{children}</>
        {!loggedIn && (
          <button onClick={() => dispatch(signupModalOpened())}>{t("welcome.create_account")}</button>
        )}
      </div>
    </div>
  );
};

WelcomeBanner.propTypes = {
  className: PropTypes.string,
  children: PropTypes.element,
  hideIfMember: PropTypes.bool,
};

export default WelcomeBanner;
