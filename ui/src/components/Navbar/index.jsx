import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Link from '../../components/Link';
import { kRound, mfetch, onKeyEnter, stringCount } from '../../helper';
import { mobileBreakpointWidth, useTheme, useWindowWidth } from '../../hooks';
import { clearNotificationsLocalStorage } from '../../PushNotifications';
import {
  chatOpenToggled,
  loginModalOpened,
  notificationsReloaded,
  signupModalOpened,
  snackAlert,
  snackAlertError,
  toggleSidebarOpen,
} from '../../slices/mainSlice';
import { homeReloaded } from '../../views/PostsFeed';
import { ButtonBack, ButtonHamburger, ButtonNotifications } from '../Button';
import Dropdown from '../Dropdown';
import Search from './Search';
import { useTranslation } from "react-i18next";
import favicon from '../../assets/imgs/favicon.png';
import UserProPic from '../UserProPic';

const Navbar = ({ offline = false }) => {

  const [t, i18n] = useTranslation("global");

  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const homeFeed = loggedIn ? user.homeFeed : 'all';
  const notifsNewCount = useSelector((state) => state.main.notifications.newCount);

  const handleLogout = async () => {
    clearNotificationsLocalStorage();
    try {
      const res = await mfetch('/api/_login?action=logout', {
        method: 'POST',
      });
      if (!res.ok) {
        snackAlert(t('logout_failure'))
        return;
      }
      window.location.reload();
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const handleLogoClick = () => {
    dispatch(homeReloaded(homeFeed, user && user.rememberFeedSort));
    setTimeout(() => window.scrollTo(0, 0), 10);
  };

  const handleHamburgerClick = () => {
    dispatch(toggleSidebarOpen());
  };

  const location = useLocation();
  const handleNotifIconClick = () => {
    if (location.pathname === '/notifications') {
      dispatch(notificationsReloaded());
    }
  };

  // Only enable background blur when scrolled down.
  const supportsBlur = () => window.CSS && window.CSS.supports('backdrop-filter', 'blur(10px)');
  const [blur, setBlur] = useState(supportsBlur() && window.scrollY > 50);
  const blurRef = useRef(blur);
  const navbarRef = useRef();
  useEffect(() => {
    if (supportsBlur()) {
      const listner = () => {
        if (window.scrollY > 50) {
          if (blurRef.current !== true) {
            blurRef.current = true;
            setBlur(true);
          }
        } else {
          if (blurRef.current !== false) {
            blurRef.current = false;
            setBlur(false);
          }
        }
      };
      window.addEventListener('scroll', listner, { passive: true });
      return () => window.removeEventListener('scroll', listner);
    }
  }, []);

  const { theme, setTheme } = useTheme();
  const handleDarkModeChange = (e) => {
    const checked = e.target.checked;
    setTheme(checked ? 'dark' : 'light');
  };

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= mobileBreakpointWidth;
  const path = window.location.pathname
  const isAtHome = path === '/' ? true : false

  return (
    <header className={'navbar' + (blur ? ' is-blured' : '')} ref={navbarRef}>
      <div className="wrap">
        <div className="left">
          <div className="hamburger-m">
            {isMobile && !isAtHome && (
              <ButtonBack onClick={() => history.goBack()} />
            )}
            {isMobile && isAtHome && (
              <ButtonHamburger onClick={handleHamburgerClick} />
            )}
            {!isMobile && (
              <ButtonHamburger onClick={handleHamburgerClick} />
            )}
          </div>
          <Link
            to="/"
            className="navbar-logo"
            style={{ fontSize: '1.65rem', wordBreak: 'keep-all', display: 'inline-flex' }}
            onClick={handleLogoClick}
          >
            <img alt={`Bulan.mn`} src={favicon} style={{ height: 25, width: 25, marginRight: 4 }} />
            {import.meta.env.VITE_SITENAME}
          </Link>
          <Search />
        </div>
        <div className="right">
          {import.meta.env.MODE !== 'production' && (
            <button
              className="button-text is-no-m"
              onClick={() => dispatch(chatOpenToggled())}
              disabled={offline}
            >
              Chat
            </button>
          )}
          {import.meta.env.MODE !== 'production' && (
            <Link className="is-no-m" to="/elements">
              Elements
            </Link>
          )}
          {!loggedIn && (
            <>
              <button
                className="button-text"
                onClick={() => dispatch(loginModalOpened())}
                disabled={offline}
              >
                {t("auth.login")}
              </button>
              <button
                className="button-main"
                onClick={() => dispatch(signupModalOpened())}
                disabled={offline}
              >
                {t("auth.signup")}
              </button>
            </>
          )}
          {/*<ButtonSearch />*/}
          {loggedIn && (
            <Link to="/notifications" onClick={handleNotifIconClick}>
              <ButtonNotifications count={notifsNewCount} />
            </Link>
          )}
          {loggedIn && (
            <Dropdown
              className="navbar-profile"
              target={
                <div className="navbar-profile-target">
                  <span className="navbar-points">{`${kRound(user.points)} ${stringCount(
                    user.points,
                    true,
                    t('helper.point'),
                  )}`}</span>
                  <span className="navbar-name">
                    {/* @
                    {windowWidth < 400 || (isMobile && user.username.length > 10)
                      ? 'me'
                      : user.username} */}
                    <UserProPic username={user.username} proPic={user.proPic} size='small' />
                  </span>
                </div>
              }
              aligned="right"
            >
              <div className="dropdown-list">
                <Link className="link-reset dropdown-item" to="/settings">
                  {t("navbar.settings")}
                </Link>
                <Link className="link-reset dropdown-item" to={`/@${user.username}`}>
                  {t("navbar.profile")}
                </Link>
                {user.isAdmin && (
                  <Link className="link-reset dropdown-item" to={`/admin`}>
                    {t("navbar.admin")}
                  </Link>
                )}
                {/*<div className="dropdown-item">Darkmode</div>*/}
                <div className="dropdown-item is-non-reactive">
                  <div className="checkbox">
                    <input
                      id={'ch-nav-dark'}
                      className="switch"
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={handleDarkModeChange}
                    />
                    <label htmlFor={'ch-nav-dark'}>{t("navbar.dark_mode")}</label>
                  </div>
                </div>
                <div className="dropdown-list-sep"></div>
                <div
                  role="button"
                  tabIndex="0"
                  className="dropdown-item"
                  onClick={handleLogout}
                  onKeyUp={(e) => onKeyEnter(e, handleLogout)}
                >
                  {t('navbar.logout')}
                </div>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  offline: PropTypes.bool,
};

export default Navbar;
