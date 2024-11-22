import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ButtonClose } from '../../components/Button';
import Link from '../../components/Link';
import MiniFooter from '../../components/MiniFooter';
import Modal from '../../components/Modal';
import Sidebar from '../../components/Sidebar';
import { isDeviceIos, isDeviceStandalone } from '../../helper';
import { createCommunityModalOpened, showAppInstallButton } from '../../slices/mainSlice';
import LoginForm from '../../views/LoginForm';
import PostsFeed from '../../views/PostsFeed';
import WelcomeBanner from '../../views/WelcomeBanner';
import { Trans, useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';

const Home = () => {
  const [t, i18next] = useTranslation("global");
  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;
  const canCreateForum = loggedIn && (user.isAdmin || !import.meta.env.VITE_DISABLEFORUMCREATION);

  const location = useLocation();
  const feedType = (() => {
    let f = 'all';
    if (loggedIn) {
      f = location.pathname === '/' ? user.homeFeed : location.pathname.substring(1);
    }
    return f;
  })();

  const { show: showInstallPrompt, deferredPrompt } = useSelector(
    (state) => state.main.appInstallButton
  );

  const dispatch = useDispatch();
  const [neverShowBanner, setNeverShowBanner] = useState(
    localStorage.getItem('neverShowInstallBanner') === 'true'
  );

  useEffect(() => {
    if (!isDeviceStandalone() || !neverShowBanner) {
      if ('onbeforeinstallprompt' in window) {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          dispatch(showAppInstallButton(true, e));
        });
        if (window.appData && window.appData.deferredInstallPrompt) {
          dispatch(showAppInstallButton(true, window.appData.deferredInstallPrompt));
        }
      } else {
        // probably iOS
        if (isDeviceIos()) {
          dispatch(showAppInstallButton(true));
        }
      }
    }
  }, [dispatch, neverShowBanner]);

  const handleNeverShowBanner = () => {
    localStorage.setItem('neverShowInstallBanner', 'true');
    setNeverShowBanner(true);
  };

  // GoogleAnalytics
  useEffect(() => {
    ReactGA.initialize('G-6FC9YCEJXN');
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <div className="page-content page-home wrap page-grid">
      <Sidebar />
      <main className="posts">
        {showInstallPrompt && !neverShowBanner && (
          <div className="banner-install is-m">
            <div className="banner-install-text">{t("homepage.text_1")}</div>
            <div className="banner-install-actions">
              <ButtonAppInstall className="banner-install-button" deferredPrompt={deferredPrompt}>
                {t('homepage.install')}
              </ButtonAppInstall>
              <ButtonClose onClick={handleNeverShowBanner} style={{ color: "inherit" }} />
            </div>
          </div>
        )}
        {loggedIn && (
          <Link className="button button-main home-btn-new-post is-m" to="/new">
            {t("post.actions.create")}
          </Link>
        )}
        {canCreateForum && (
          <>
            <Link
              to="#"
              onClick={() => dispatch(createCommunityModalOpened())}
              className={'button button-main home-btn-new-post is-m'}
            >
              {t("create_community.action")}
            </Link>
          </>
        )}
        <PostsFeed feedType={feedType} />
      </main>
      {/*
      <div className="posts">
        <div className="post-card-compact-list">
          <PostCard initialPost={templatePost} compact={true} />
          <PostCard initialPost={templatePost} compact={true} />
          <PostCard initialPost={templatePost} compact={true} />
        </div>
      </div>*/}
      <aside className="sidebar-right is-custom-scrollbar is-v2'">
        {!loggedIn && (
          <div className="card card-sub card-padding">
            <LoginForm />
          </div>
        )}
        <WelcomeBanner />
        <MiniFooter />
      </aside>
    </div>
  );
};

export default Home;

export const ButtonAppInstall = ({ deferredPrompt, children, ...props }) => {
  const [t, i18next] = useTranslation("global");
  const [showIosModal, setShowIosModal] = useState(false);
  const handleIosModalClose = () => setShowIosModal(false);

  const handleClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      // show iOS modal
      setShowIosModal(true);
    }
  };

  return (
    <>
      <button {...props} onClick={handleClick}>
        {children}
      </button>
      <Modal open={showIosModal} onClose={handleIosModalClose}>
        <div className="modal-card is-compact-mobile modal-ios-install">
          <div className="modal-card-head">
            <div className="modal-card-title">{t('homepage.install_title')}</div>
            <ButtonClose onClick={handleIosModalClose} />
          </div>
          <div className="modal-card-content">
            <div className="modal-ios-install-steps">
              <ol>
                <li>{t('homepage.ios_step_1')}
                  <br />
                  &nbsp;&nbsp;&nbsp;icon: <svg fill="#000000" width="40px" height="40px" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" /><path d="M24 7h2v21h-2z" /><path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z" /></svg>
                </li>
                <li>{t('homepage.ios_step_2')}</li>
                <li>{t('homepage.ios_step_3')}</li>
              </ol>
              <p>{t('homepage.ios_description')}</p>
            </div>
          </div>
          <div className="modal-card-actions">
            <button onClick={handleIosModalClose}>{t('close_button')}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

ButtonAppInstall.propTypes = {
  deferredPrompt: PropTypes.object,
  children: PropTypes.node.isRequired,
};
