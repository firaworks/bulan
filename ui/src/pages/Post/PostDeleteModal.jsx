import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ButtonClose } from '../../components/Button';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const PostDeleteModal = ({ open, onClose, onDelete, postType, canDeleteContent = false }) => {
  const [t, i18n] = useTranslation("global");
  const [deleteContent, setDeleteContent] = useState(false);

  const showCheckbox = canDeleteContent && (postType === 'image' || postType === 'link');

  let label = t('also_delete');
  if (postType === 'image') label = t('image_too') + label;
  else if (postType === 'link') label = t('link_too') + label;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-card is-compact-mobile is-center modal-delete-post">
        <div className="modal-card-head">
          <div className="modal-card-title">{t("post_modal.delete_post")}</div>
          <ButtonClose onClick={onClose} />
        </div>
        <div className="modal-card-content">
          <p>{t("post_modal.alert_1")}</p>
          {showCheckbox && (
            <div className="checkbox" style={{ marginTop: '5px' }}>
              <input
                id="post_del_content"
                type="checkbox"
                checked={deleteContent}
                onChange={(e) => setDeleteContent(e.target.checked)}
              />
              <label htmlFor="post_del_content">{label}</label>
            </div>
          )}
        </div>
        <div className="modal-card-actions">
          <button className="button-main" onClick={() => onDelete(deleteContent)}>
            {t("yes")}
          </button>
          <button onClick={onClose}>{t('no')}</button>
        </div>
      </div>
    </Modal>
  );
};

PostDeleteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  postType: PropTypes.string.isRequired,
  canDeleteContent: PropTypes.bool,
};

export const PostContentDeleteModal = ({ open, onClose, onDelete, post }) => {
  const [t, i18n] = useTranslation("global");
  const postContentType =
    post.type === 'image' ? (post.images.length > 1 ? 'images' : 'image') : post.type;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-card">
        <div className="modal-card-head">
          <div className="modal-card-title">{t("post_modal.delete_post")}</div>
          <ButtonClose onClick={onClose} />
        </div>
        <div className="modal-card-content">
          <p>{t("post_modal.alert_2")}</p>
        </div>
        <div className="modal-card-actions">
          <button className="button-main" onClick={onDelete}>
            {t("yes")}
          </button>
          <button onClick={onClose}>{t("no")}</button>
        </div>
      </div>
    </Modal>
  );
};

PostContentDeleteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
};

export default PostDeleteModal;
