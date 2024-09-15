import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ButtonClose } from '../../components/Button';
import Modal from '../../components/Modal';
import Badge from './Badge';
import { useTranslation } from 'react-i18next';

function BadgesList({ user }) {
  const { badges } = user;
  const [t, i18n] = useTranslation("global");
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalClose = () => setModalOpen(false);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setModalOpen(true);
  };

  let modalTitle, modalDesc;
  if (selectedBadge) {
    switch (selectedBadge.type) {
      case 'supporter':
        modalTitle = t("user.modal.title");
        modalDesc = t("user.modal.description");
        break;
      default:
        throw new Error(`unkown badge type '${selectedBadge.type}'`);
    }
  }

  return (
    <div className="user-badges">
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div className="modal-card is-compact-mobile is-center modal-badges">
          <div className="modal-badges-head">
            <ButtonClose className="modal-badges-close" onClick={handleModalClose} />
            <Badge badge={selectedBadge} />
          </div>
          <div className="modal-badges-body">
            <div className="modal-badges-title">{modalTitle}</div>
            <div className="modal-badges-desc">{modalDesc}</div>
          </div>
        </div>
      </Modal>
      <div className="user-badges-items">
        {badges.map((badge) => (
          <Badge key={badge.id} badge={badge} onClick={() => handleBadgeClick(badge)} />
        ))}
      </div>
    </div>
  );
}

BadgesList.propTypes = {
  user: PropTypes.object.isRequired,
};

export default BadgesList;
