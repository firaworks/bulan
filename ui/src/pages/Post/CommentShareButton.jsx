import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from '../../components/Dropdown';
import { copyToClipboard, publicURL } from '../../helper';
import { snackAlert } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

export const CommentShareDropdownItems = ({ prefix = '', url }) => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();
  const handleCopyURL = () => {
    let text = t('copy_failed')
    if (copyToClipboard(publicURL(url))) {
      text = t('copied_link')
    }
    dispatch(snackAlert(text, 'comment_link_copied'));
  };

  const to = prefix !== '' ? prefix : 'To ';

  return (
    <>
      {/* <div className="dropdown-item">{to}Facebook</div>
      <div className="dropdown-item">{to}Twitter</div> */}
      <div className="dropdown-item" onClick={handleCopyURL}>
        {t("copy_url")}
      </div>
    </>
  );
};

CommentShareDropdownItems.propTypes = {
  prefix: PropTypes.string,
  url: PropTypes.string.isRequired,
};

const CommentShareButton = ({ url }) => {
  const [t, i18n] = useTranslation("global");
  return (
    <Dropdown target={<button className="button-text post-comment-button">{t('share')}</button>}>
      <div className="dropdown-list">
        <CommentShareDropdownItems url={url} />
      </div>
    </Dropdown>
  );
};

CommentShareButton.propTypes = {
  url: PropTypes.string.isRequired,
};

export default CommentShareButton;
