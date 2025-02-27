import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import Dropdown from '../../components/Dropdown';
import { copyToClipboard } from '../../helper';
import { snackAlert } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const Target = ({ ...props }) => {
  const [t, i18n] = useTranslation("global");
  return (
    <div className="button button-with-icon button-text" {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M19.6495 0.799565C18.4834 -0.72981 16.0093 0.081426 16.0093 1.99313V3.91272C12.2371 3.86807 9.65665 5.16473 7.9378 6.97554C6.10034 8.9113 5.34458 11.3314 5.02788 12.9862C4.86954 13.8135 5.41223 14.4138 5.98257 14.6211C6.52743 14.8191 7.25549 14.7343 7.74136 14.1789C9.12036 12.6027 11.7995 10.4028 16.0093 10.5464V13.0069C16.0093 14.9186 18.4834 15.7298 19.6495 14.2004L23.3933 9.29034C24.2022 8.2294 24.2022 6.7706 23.3933 5.70966L19.6495 0.799565ZM7.48201 11.6095C9.28721 10.0341 11.8785 8.55568 16.0093 8.55568H17.0207C17.5792 8.55568 18.0319 9.00103 18.0319 9.55037L18.0317 13.0069L21.7754 8.09678C22.0451 7.74313 22.0451 7.25687 21.7754 6.90322L18.0317 1.99313V4.90738C18.0317 5.4567 17.579 5.90201 17.0205 5.90201H16.0093C11.4593 5.90201 9.41596 8.33314 9.41596 8.33314C8.47524 9.32418 7.86984 10.502 7.48201 11.6095Z" fill="currentColor" />
        <path d="M7 1.00391H4C2.34315 1.00391 1 2.34705 1 4.00391V20.0039C1 21.6608 2.34315 23.0039 4 23.0039H20C21.6569 23.0039 23 21.6608 23 20.0039V17.0039C23 16.4516 22.5523 16.0039 22 16.0039C21.4477 16.0039 21 16.4516 21 17.0039V20.0039C21 20.5562 20.5523 21.0039 20 21.0039H4C3.44772 21.0039 3 20.5562 3 20.0039V4.00391C3 3.45162 3.44772 3.00391 4 3.00391H7C7.55228 3.00391 8 2.55619 8 2.00391C8 1.45162 7.55228 1.00391 7 1.00391Z" fill="currentColor" />
      </svg>
      <span>{t('share')}</span>
    </div>
  );
};

const PostShareButton = ({ post }) => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();

  const url = `${window.location.origin}/${post.communityName}/post/${post.publicId}`;
  const handleCopyURL = () => {
    let text = t('copy_failed')
    if (copyToClipboard(url)) {
      text = t('copied_link')
    }
    dispatch(snackAlert(text, 'pl_copied'));
  };

  const hasMoreShareableOptions = window.innerWidth < 1171 && Boolean(navigator.share);
  const handleMoreButtonClick = async () => {
    try {
      await navigator.share({
        title: post.title,
        url,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderImageDownloadButton = () => {
    if (post.images.length === 0) {
      return (
        <div className="button-clear dropdown-item" style={{ opacity: 'var(--disabled-opacity)' }}>
          {t("download_image")}
        </div>
      );
    }

    const image = post.images[post.imageGalleryIndex];
    const url = image.url;
    const filename = `bulan-${post.communityName}[${post.publicId}]-${post.imageGalleryIndex + 1
      }.${image.format}`;
    return (
      <a href={url} className="button-clear dropdown-item" download={filename}>
        {t("download_image")}
      </a>
    );
  };

  const twitterText = `"${post.title}" ${url}`;
  const fbAppID = '1202053838003461'
  const redirectUri = encodeURIComponent(window.location.href);

  return (
    <Dropdown target={<Target />}>
      <div className="dropdown-list">
        <a
          className="button-clear dropdown-item button-with-icon"
          target="_blank"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`}
          rel="noreferrer"
          style={{ display: 'block' }}
        >
          <svg style={{ verticalAlign: 'middle' }} width={28} height={28} fill='currentColor' viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
          &nbsp;
          {t("to_x")}
        </a>
        <a
          className="button-clear dropdown-item"
          target="_blank"
          href={`https://www.facebook.com/sharer.php?u=${url}`}
          rel="noreferrer"
          style={{ display: 'block' }}
        >
          <svg style={{ verticalAlign: 'middle' }} width={28} height={28} fill='currentColor' viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></svg>
          &nbsp;
          {t("to_fb")}
        </a>
        <a
          className="button-clear dropdown-item"
          target="_blank"
          href={`https://threads.net/intent/post?text=${url}`}
          rel="noreferrer"
          style={{ display: 'block' }}
        >
          <svg style={{ verticalAlign: 'middle' }} width={28} height={28} fill='currentColor' viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><title>Threads</title><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" /></svg>
          &nbsp;
          {t("to_threads")}
        </a>
        <a
          className="button-clear dropdown-item"
          target="_blank"
          href={`https://www.facebook.com/dialog/send?app_id=${fbAppID}&link=${url}&redirect_uri=${redirectUri}`}
          rel="noreferrer"
          style={{ display: 'block' }}
        >
          <svg style={{ verticalAlign: 'middle' }} width={28} height={28} fill='currentColor' viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><title>Messenger</title><path d="M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z" /></svg>
          &nbsp;
          {t("to_fb_messenger")}
        </a>
        <button className="button-clear dropdown-item" style={{ display: 'block' }} onClick={handleCopyURL}>
          <svg style={{ verticalAlign: 'middle' }} width={28} height={28} fill="none" viewBox="0 0 28 28" strokeWidth="1.5" stroke="currentColor" >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
          </svg>
          &nbsp;
          {t("copy_url")}
        </button>
        {post.type === 'image' && renderImageDownloadButton()}
        {hasMoreShareableOptions && (
          <button className="button-clear dropdown-item" onClick={handleMoreButtonClick}>
            {t('other')}
          </button>
        )}
      </div>
    </Dropdown>
  );
};

PostShareButton.propTypes = {
  post: PropTypes.object.isRequired,
};

export default PostShareButton;
