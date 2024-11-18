import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonClose } from '../../components/Button';
import { FormField } from '../../components/Form';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { mfetch } from '../../helper';
import { snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const Mods = ({ community }) => {
  const user = useSelector((state) => state.main.user);
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation();
  const [addModOpen, setAddModOpen] = useState(false);
  const handleAddModClose = () => setAddModOpen(false);
  const [newModName, setNewModName] = useState('');

  const baseURL = `/api/communities/${community.id}/mods`;

  const handleAddMod = async (e) => {
    if (e) {
      e.preventDefault();
    }
    try {
      const res = await mfetch(baseURL, {
        method: 'POST',
        body: JSON.stringify({
          username: newModName,
        }),
      });
      if (res.ok) {
        alert(`${newModName} ${t("mod.mod_added")}`);
        window.location.reload();
      } else if (res.status === 404) {
        alert(t('mod.user_not_found'));
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const handleRemoveMod = async (username) => {
    if (
      !confirm(`@${username}${t("mod.mod_remove_confirm")}?`)
    ) {
      return;
    }
    try {
      const res = await mfetch(`${baseURL}/${username}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert(`@${username}${t("mod.mod_removed")}`);
        window.location.reload();
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      dispatch(snackAlertError(error));
    }
  };

  const { mods } = community;
  let myPos;
  mods.forEach((mod, index) => {
    if (mod.id === user.id) {
      myPos = index;
    }
  });

  return (
    <div className="modtools-content modtools-mods">
      <Modal open={addModOpen} onClose={handleAddModClose}>
        <div className="modal-card">
          <div className="modal-card-head">
            <div className="modal-card-title">{t('mod.mod_add_title')}</div>
            <ButtonClose onClick={handleAddModClose} />
          </div>
          <form className="modal-card-content" onSubmit={handleAddMod}>
            <FormField label={t('username')} errors={null}>
              <Input value={newModName} onChange={(e) => setNewModName(e.target.value)} autoFocus />
            </FormField>
          </form>
          <div className="modal-card-actions">
            <button className="button-main" disabled={newModName === ''} onClick={handleAddMod}>
              {t("mod.add")}
            </button>
            <button onClick={handleAddModClose}>{t("cancel_button")}</button>
          </div>
        </div>
      </Modal>
      <div className="modtools-content-head">
        <div className="modtools-title">{t('mod.mods')}</div>
        <button className="button-main" onClick={() => setAddModOpen(true)}>
          {t("mod.add")}
        </button>
      </div>
      <div className="modtools-mods-list">
        <div className="table">
          {mods.map((mod, index) => (
            <div className="table-row" key={mod.id}>
              <div className="table-column">{index}</div>
              <div className="table-column">{mod.username}</div>
              <div className="table-column">
                {(myPos <= index || user.isAdmin) && (
                  <button className="button-red" onClick={() => handleRemoveMod(mod.username)}>
                    {t('mod.remove')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Mods.propTypes = {
  community: PropTypes.object.isRequired,
};

export default Mods;
