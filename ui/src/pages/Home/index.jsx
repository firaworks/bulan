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
import { useTranslation } from 'react-i18next';

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

  useEffect(() => {
    if (!isDeviceStandalone()) {
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
  }, []);

  return (
    <div className="page-content page-home wrap page-grid">
      <Sidebar />
      <main className="posts">
        {showInstallPrompt && (
          <div className="banner-install is-m">
            {/*<ButtonClose className="banner-button-close" />*/}
            <div className="banner-install-text">{t("homepage.text_1")}</div>
            <ButtonAppInstall className="banner-install-button" deferredPrompt={deferredPrompt}>
              {t('homepage.install')}
            </ButtonAppInstall>
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
            <div className="modal-card-title">{t("homepage.text_2")}</div>
            <ButtonClose onClick={handleIosModalClose} />
          </div>
          <div className="modal-card-content">
            <div className="modal-ios-install-steps">
              <ol>
                <li>{t("homepage.text_3")}</li>
                <li>{t("homepage.text_5")}</li>
                <li>{t("homepage.text_6")}</li>
              </ol>
              <p>{t("homepage.text_4")}</p>
            </div>
          </div>
          <div className="modal-card-actions">
            <button onClick={handleIosModalClose}>{t("close_button")}</button>
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
