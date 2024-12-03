import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Button, { ButtonClose } from '../components/Button';
import CommunityProPic from '../components/CommunityProPic';
import Feed from '../components/Feed';
import { FormField } from '../components/Form';
import Input, { InputWithCount, useInputMaxLength } from '../components/Input';
import MarkdownBody from '../components/MarkdownBody';
import MiniFooter from '../components/MiniFooter';
import Modal from '../components/Modal';
import ShowMoreBox from '../components/ShowMoreBox';
import Sidebar from '../components/Sidebar';
import { communityNameMaxLength } from '../config';
import { mfetch, mfetchjson } from '../helper';
import { useInputUsername } from '../hooks';
import { FeedItem } from '../slices/feedsSlice';
import { loginPromptToggled, snackAlert, snackAlertError } from '../slices/mainSlice';
import { SVGClose, SVGSearch } from '../SVGs';
import LoginForm from '../views/LoginForm';
import JoinButton from './Community/JoinButton';
import { useTranslation } from 'react-i18next';
import { isInfiniteScrollingDisabled } from './Settings/devicePrefs';

const prepareText = (isMobile = false) => {
  const [t, i18n] = useTranslation("global");
  const x = isMobile ? t("all_communities.is_mobile_1") : t("all_communities.is_mobile_2");
  return `${t("all_communities.text_1")} ${x}, ${t("all_communities.text_2")}`;
};

const AllCommunities = () => {
  const [t, i18n] = useTranslation("global");
  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setSearchQuery('');
  }, [isSearching]);

  // const { items: comms, loading } = useSelector((state) => {
  //   const names = state.main.allCommunities.items;
  //   const communities = state.communities.items;
  //   const items = [];
  //   names.forEach((name) => items.push(communities[name]));
  //   return {
  //     items: items || [],
  //     loading: state.main.allCommunities.loading,
  //   };
  // });

  const fetchCommunities = async (next) => {
    const res = await mfetchjson('/api/communities?sort=size');
    const items = res.map((community) => new FeedItem(community, 'community', community.id));
    return {
      items: items,
      next: null,
    };
  };

  const handleRenderItem = (item, index) => {
    if (
      searchQuery !== '' &&
      !item.item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ) {
      return null;
    }
    return <ListItem community={item.item} />;
  };

  const renderSearchBox = () => {
    return (
      <div className="communities-search">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsSearching(false);
            }
          }}
        />
      </div>
    );
  };

  return (
    <div className="page-content page-comms wrap page-grid">
      <Sidebar />
      <main>
        <div className="page-comms-header card card-padding">
          <div className="left">{isSearching ? renderSearchBox() : <h1>{t('all_communities.title')}</h1>}</div>
          <div className="right">
            <Button
              className={clsx('comms-search-button', !isSearching && 'is-search-svg')}
              icon={isSearching ? <SVGClose /> : <SVGSearch />}
              onClick={() => setIsSearching((v) => !v)}
            />
            {/* {!isSearching && (
              <RequestCommunityButton className="button-main is-m comms-new-button" isMobile>
                {t("all_communities.text_3")}
              </RequestCommunityButton>
            )} */}
          </div>
        </div>
        <div className="comms-list">
          <Feed
            feedId="all-communities"
            onFetch={fetchCommunities}
            onRenderItem={handleRenderItem}
            infiniteScrollingDisabled={isInfiniteScrollingDisabled()}
            noMoreItemsText={t('no_more_items')}
          />
        </div>
      </main>
      <aside className="sidebar-right">
        {!loggedIn && (
          <div className="card card-sub card-padding">
            <LoginForm />
          </div>
        )}
        {/* <CommunityCreationCard /> */}
        <MiniFooter />
      </aside>
    </div>
  );
};

AllCommunities.propTypes = {};

export default AllCommunities;

const CommunityCreationCard = () => {
  const [t, i18n] = useTranslation("global");
  return (
    <div className="card card-sub card-padding home-welcome">
      <div className="home-welcome-join">{t("all_communities.text_4")}</div>
      <div className="home-welcome-subtext">{prepareText()}</div>
      <div className="home-welcome-buttons">
        <RequestCommunityButton className="button-main">{t('all_communities.text_5')}</RequestCommunityButton>
      </div>
    </div>
  );
};

const RequestCommunityButton = ({ children, isMobile = false, ...props }) => {
  const [t, i18n] = useTranslation("global")
  const loggedIn = useSelector((state) => state.main.user) !== null;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const noteLength = 500;

  const [name, handleNameChange] = useInputUsername(communityNameMaxLength);
  const [note, handleNoteChange] = useInputMaxLength(noteLength);

  const handleButtonClick = () => {
    if (!loggedIn) {
      dispatch(loginPromptToggled());
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (name.length < 3) {
      alert(t("all_communities.alert_1"));
      return;
    }
    try {
      const res = await mfetch(`/api/community_requests`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          note,
        }),
      });
      if (res.ok) {
        dispatch(snackAlert(t("all_communities.alert_2")));
        handleClose();
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="modal-card modal-form modal-request-comm">
          <div className="modal-card-head">
            <div className="modal-card-title">{t("all_communities.text_5")}</div>
            <ButtonClose onClick={handleClose} />
          </div>
          <div className="form modal-card-content flex-column inner-gap-1">
            <div className="form-field">{isMobile && <p>{prepareText(true)}</p>}</div>
            <FormField label="Community name" description="Community name cannot be changed.">
              <InputWithCount
                value={name}
                onChange={handleNameChange}
                maxLength={communityNameMaxLength}
                style={{ marginBottom: '0' }}
                autoFocus
              />
            </FormField>
            <FormField label="Note" description="An optional message for the admins.">
              <InputWithCount
                value={note}
                onChange={handleNoteChange}
                textarea
                rows="4"
                maxLength={noteLength}
              />
            </FormField>
            <FormField>
              <button className="button-main" onClick={handleSubmit} style={{ width: '100%' }}>
                {t("all_communities.text_5")}
              </button>
            </FormField>
          </div>
        </div>
      </Modal>
      <button onClick={handleButtonClick} {...props}>
        {children}
      </button>
    </>
  );
};

RequestCommunityButton.propTypes = {
  isMobile: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

const ListItem = React.memo(function ListItem({ community }) {
  const [t, i18n] = useTranslation("global")
  const to = `/${community.name}`;

  const history = useHistory();
  const ref = useRef();

  const handleClick = (e) => {
    if (e.target.tagName !== 'BUTTON') {
      history.push(to);
    }
  };

  return (
    <div
      ref={ref}
      className="comms-list-item card"
      onClick={handleClick}
      style={{ minHeight: '100px' }}
    >
      <div className="comms-list-item-left">
        <CommunityProPic
          className="is-no-hover"
          name={community.name}
          proPic={community.proPic}
          size="large"
        />
      </div>
      <div className="comms-list-item-right">
        <div className="comms-list-item-name">
          <a
            href={to}
            className="link-reset comms-list-item-name-name"
            onClick={(e) => e.preventDefault()}
          >
            {community.name}
          </a>
          <JoinButton className="comms-list-item-join" community={community} />
        </div>
        <div className="comms-list-item-count">{`${community.noMembers} ${t('members')}`}</div>
        <div className="comms-list-item-about">
          <ShowMoreBox maxHeight="120px">
            <MarkdownBody>{community.about}</MarkdownBody>
          </ShowMoreBox>
        </div>
      </div>
    </div>
  );
});
