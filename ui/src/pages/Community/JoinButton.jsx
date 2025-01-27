import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mfetchjson } from '../../helper';
import { communityAdded } from '../../slices/communitiesSlice';
import { loginPromptToggled, snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const JoinButton = ({ className, community, ...rest }) => {
  const [t, i18next] = useTranslation("global");
  const loggedIn = useSelector((state) => state.main.user) !== null;
  const dispatch = useDispatch();
  const [joined, setJoined] = useState(community ? community.userJoined : false);

  const handleFollow = async () => {
    if (!loggedIn) {
      dispatch(loginPromptToggled());
      return;
    }
    const message = `${t("community_warning_1")} '${community.name}' ${t("community_warning_2")}`;
    if (community.userMod && !confirm(message)) {
      return;
    }
    try {
      const rcomm = await mfetchjson('/api/_joinCommunity', {
        method: 'POST',
        body: JSON.stringify({ communityId: community.id, leave: joined }),
      });
      setJoined(rcomm.userJoined)
      dispatch(communityAdded(rcomm));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  let cls = joined ? '' : 'button-main';
  if (className) cls += ` ${className}`;

  return (
    <button style={{ wordBreak: 'keep-all' }} onClick={handleFollow} className={cls}  {...rest} >
      {joined ? t('joined') : t('join')}
    </button>
  );
};

JoinButton.propTypes = {
  community: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default JoinButton;
