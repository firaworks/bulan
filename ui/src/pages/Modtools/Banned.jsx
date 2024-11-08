import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ButtonClose } from '../../components/Button';
import { FormField } from '../../components/Form';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { APIError, mfetch, mfetchjson } from '../../helper';
import { useLoading } from '../../hooks';
import { snackAlert, snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const Banned = ({ community }) => {
  const [t, i18n] = useTranslation();
  const dispatch = useDispatch();

  const baseURL = `/api/communities/${community.id}`;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useLoading();
  useEffect(() => {
    (async () => {
      try {
        const banned = await mfetchjson(`${baseURL}/banned`);
        setUsers(banned);
        setLoading('loaded');
      } catch (error) {
        setLoading('failed');
      }
    })();
  }, [community.id]);

  const [modalError, setModalError] = useState('');
  const [username, _setUsername] = useState('');
  const setUsername = (name) => {
    if (name === '') setModalError('');
    _setUsername(name);
  };
  const [banModalOpen, setBanModalOpen] = useState(false);
  const handleBanModalClose = () => {
    setBanModalOpen(false);
    setUsername('');
  };
  const handleBanClick = async () => {
    try {
      const res = await mfetch(`${baseURL}/banned`, {
        method: 'POST',
        body: JSON.stringify({
          username,
        }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          setModalError(t("mod.ban.alert_1"));
        } else if (res.status === 409) {
          setModalError(`${username} ${t("mod.ban.alert_2")}`);
        } else if (res.status === 403) {
          dispatch(snackAlert(t('forbidden'), 'forbidden'));
        } else {
          throw new APIError(res.status, await res.json());
        }
      } else {
        dispatch(snackAlert(`@${username} ${t("mod.ban.alert_3")}`));
        const user = await res.json();
        setUsers((users) => [...users, user]);
        handleBanModalClose();
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const handleUnbanClick = async (username) => {
    try {
      const user = await mfetchjson(`${baseURL}/banned`, {
        method: 'DELETE',
        body: JSON.stringify({
          username,
        }),
      });
      setUsers((users) => users.filter((u) => u.username !== user.username));
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  if (loading !== 'loaded') {
    return null;
  }

  return (
    <div className="modtools-content modtools-banned">
      <Modal open={banModalOpen} onClose={handleBanModalClose}>
        <div className="modal-card">
          <div className="modal-card-head">
            <div className="modal-card-title">{t("mod.ban.action")}</div>
            <ButtonClose onClick={handleBanModalClose} />
          </div>
          <form
            className="modal-card-content"
            onSubmit={(e) => {
              e.preventDefault();
              handleBanClick();
            }}
          >
            <FormField label={t('username')} error={modalError}>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </FormField>
          </form>
          <div className="modal-card-actions">
            <button className="button-main" disabled={username === ''} onClick={handleBanClick}>
              {t("mod.ban.title")}
            </button>
            <button onClick={handleBanModalClose}>{t("cancel_button")}</button>
          </div>
        </div>
      </Modal>
      <div className="modtools-content-head">
        <div className="modtools-title">{t("mod.ban.banned")} ({users.length})</div>
        <button className="button-main" onClick={() => setBanModalOpen(true)}>
          {t("mod.ban.action")}
        </button>
      </div>
      <div className="modtools-banned-users">
        <div className="table">
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <div className="table-column">@{user.username}</div>
              <div className="table-column"></div>
              <div className="table-column">
                <button onClick={() => handleUnbanClick(user.username)}>{t('mod.ban.action_2')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Banned.propTypes = {
  community: PropTypes.object.isRequired,
};

export default Banned;
