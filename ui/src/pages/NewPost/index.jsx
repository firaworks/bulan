import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { ButtonClose } from '../../components/Button';
import Link from '../../components/Link';
import PageLoading from '../../components/PageLoading';
import Spinner from '../../components/Spinner';
import Textarea from '../../components/Textarea';
import { APIError, isValidHttpUrl, mfetch, mfetchjson } from '../../helper';
import { useLoading, useQuery } from '../../hooks';
import { snackAlert, snackAlertError } from '../../slices/mainSlice';
import { postAdded } from '../../slices/postsSlice';
import Rules from '../Community/Rules';
import AsUser from '../Post/AsUser';
import CommunityCard from '../Post/CommunityCard';
import Image from './Image';
import SelectCommunity from './SelectCommunity';
import { useTranslation } from 'react-i18next';

const NewPost = () => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const user = useSelector((state) => state.main.user);
  const loggedIn = user !== null;
  useEffect(() => {
    if (!loggedIn) history.push('/login');
  }, [loggedIn]);

  const query = useQuery();
  const isEditPost = query.has('edit');
  const editPostId = query.get('edit');
  const [changed, setChanged] = useState(false);

  const [postType, setPostType] = useState('text');
  const [userGroup, setUserGroup] = useState('normal');

  const bannedFrom = useSelector((state) => state.main.bannedFrom);
  const [community, setCommunity] = useState(null);

  const [isBanned, setIsBanned] = useState(false);
  const [isUserMod, setIsUserMod] = useState(false);

  useEffect(() => {
    if (community !== null) {
      const isBanned = bannedFrom.find((id) => id === community.id) !== undefined;
      setIsBanned(isBanned);
    } else {
      setIsBanned(false);
    }
    setIsUserMod(community === null ? false : community.userMod);
  }, [community, bannedFrom]);

  const handleCommunityChange = async (ncomm) => {
    try {
      const rcomm = await mfetchjson(`/api/communities/${ncomm.id}`);
      setCommunity(rcomm);
      const query = new URLSearchParams(history.location.search);
      if (query.get('community') !== ncomm.name) {
        query.set('community', ncomm.name);
        history.replace(`${history.location.pathname}?${query.toString()}`);
      }
    } catch (error) {
      snackAlertError(error);
    }
  };

  const [title, _setTitle] = useState('');
  const setTitle = (title) => _setTitle(title.length > 255 ? title.substr(0, 256) : title);
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [images, SetImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoWidth, setVideoWidth] = useState(0)
  const [videoHeight, setVideoHeight] = useState(0)
  const [videoThumbnails, setVideoThumbnails] = useState([]);
  const [videoThumbnailId, setVideoThumbnailId] = useState(0);

  const maxNumOfImages = import.meta.env.VITE_MAXIMAGESPERPOST;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useLoading();
  useEffect(() => {
    if (isEditPost) {
      (async () => {
        try {
          const post = await mfetchjson(`/api/posts/${editPostId}?fetchCommunity=true`);
          setCommunity(post.community);
          setTitle(post.title);
          setBody(post.body);
          setPost(post);
          if (post.type === 'image') {
            SetImages(post.images);
          } else if (post.type === 'link') {
            setLink(post.deletedContent ? 'Deleted link' : post.link.url);
          } else if (post.type == 'video') {
            setVideo(post.deletedContent ? 'Deleted video' : post.video)
          }
          setPostType(post.type);
          setLoading('loaded');
        } catch (error) {
          dispatch(snackAlertError(error));
        }
      })();
    } else {
      setLoading('loaded');
    }
  }, [editPostId]);

  useLayoutEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const abortController = useRef(new AbortController());
  const handleImagesUpload = async (files = []) => {
    if (isUploading) {
      return;
    }
    // Check to see if uploading these images would reach the max image limit.
    if (images.length + files.length > maxNumOfImages) {
      alert(
        `${t("new_post.alert_2")} ${maxNumOfImages} ${t("new_post.alert_3")}`
      );
      return;
    }
    setIsUploading(true);
    for (const file of files) {
      try {
        const data = new FormData();
        data.append('image', file);
        const res = await mfetch('/api/_uploadImage', {
          signal: abortController.current.signal,
          method: 'POST',
          body: data,
        });
        if (!res.ok) {
          if (res.status === 400) {
            const error = await res.json();
            if (error.code === 'file_size_exceeded') {
              dispatch(snackAlert(t("new_post.alert_4")));
              return;
            } else if (error.code === 'unsupported_image') {
              dispatch(snackAlert(t("new_post.alert_5")));
              return;
            }
          }
          throw new APIError(res.status, await res.json());
        }
        const resImage = await res.json();
        SetImages((images) => {
          return [...images, resImage];
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          dispatch(snackAlertError(error));
        }
        break;
      }
    }
    setIsUploading(false);
  };
  const deleteImage = (imageId) => {
    // TODO: send DELETE request to server.
    SetImages((images) => images.filter((image) => image.id !== imageId));
  };

  const handleVideoUpload = async (files = []) => {
    if (isUploading) {
      return;
    }
    // Check to see if uploading multiple files.
    if (files.length > 1) {
      alert(`${t('only_single_video_allowed')}`);
      return;
    }
    setIsUploading(true);
    try {
      const data = new FormData();
      const { thumbs, width, height, duration } = await extractVideoFrames(files[0])

      data.append('w', width)
      data.append('h', height)
      data.append('video', files[0])

      if (!isNaN(maxVideoDuration) && duration > maxVideoDuration) {
        dispatch(snackAlert(t("new_post.video_duration_exceeded")));
        setIsUploading(false);
        return;
      }

      const res = await mfetch('/api/_uploadVideo', {
        signal: abortController.current.signal,
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          setIsUploading(false);
          if (error.code === 'file_size_exceeded') {
            dispatch(snackAlert(t('new_post.file_size_exceeded')));
            return;
          } else if (error.code === 'video_duration_exceeded') {
            dispatch(snackAlert(t("new_post.video_duration_exceeded")));
            return;
          } else if (error.code === 'unsupported_image') {
            dispatch(snackAlert(t("new_post.alert_5")));
            return;
          }
        }
        throw new APIError(res.status, await res.json());
      }
      const resVid = await res.json();
      setVideoThumbnails(thumbs)
      setVideo(resVid)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        dispatch(snackAlertError(error));
      }
    }
    setIsUploading(false);
  };

  // For only when editing a post.
  const returnToWhence = (post) => {
    const state = location.state;
    if (state && state.fromPostPage) {
      // fromPostPage property is set manually upon edit button click.
      history.goBack();
    } else {
      history.replace(`/${post.communityName}/post/${post.publicId}`);
    }
  };

  const isPostingDisabled =
    community !== null &&
    (isBanned || (!isEditPost && community.postingRestricted && !(isUserMod || user.isAdmin)));

  const getPostingDisabledText = () => {
    if (isBanned) {
      return t('new_post.banned')
    } else {
      return t('new_post.posting_restricted')
    }
  };

  const [_isSubmitDisabled, setIsSubmitting] = useState(false);
  const isSubmitDisabled = _isSubmitDisabled || isUploading || isPostingDisabled;
  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    if (isBanned) {
      alert(t("new_post.alert_6"));
      return;
    }
    if (community === null) {
      alert(t("new_post.alert_7"));
      return;
    }
    if (title.length < 3) {
      if (title.length === 0) {
        alert(t("new_post.alert_8"));
        return;
      }
      alert(t("new_post.alert_9"));
      return;
    }
    if (postType === 'image') {
      if (images.length === 0) {
        alert(t("new_post.alert_10"));
        return;
      }
    }
    if (postType === 'link') {
      if (link === '') {
        alert(t("new_post.alert_11"));
        return;
      }
    }
    if (postType === 'video') {
      if (video == null) {
        alert(t("new_post.missing_video"));
        return;
      }
    }
    try {
      setIsSubmitting(true);
      let newPost;
      if (isEditPost) {
        newPost = await mfetchjson(`/api/posts/${editPostId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, body, userGroup }),
        });
      } else {
        if (postType == 'video') {
          setLoading('loading')
        }
        const res = await mfetch('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            type: postType,
            title,
            body,
            community: community.name,
            userGroup,
            images:
              postType === 'image'
                ? images.map((image) => {
                  return {
                    imageId: image.id,
                    caption: '',
                  };
                })
                : undefined,
            url: postType === 'link' ? link : undefined,
            video: postType === 'video' ? {
              id: video.id,
              s3_path: video.s3Path,
              thumbnail_id: videoThumbnailId
            } : undefined,
          }),
        });
        if (!res.ok) {
          if (res.status === 400) {
            const error = await res.json();
            if (error.code === 'invalid_url') {
              dispatch(snackAlert(t("new_post.alert_12")));
              return;
            }
          }
          throw new APIError(res.status, await res.json());
        }
        newPost = await res.json();
        if (postType === 'video') {
          history.replace({
            pathname: '/',
            state: { videoId: newPost }
          });
          return
        }
      }
      dispatch(postAdded(newPost));
      returnToWhence(newPost);
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      if (postType == 'video') {
        setLoading('loaded')
      }
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const listner = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', listner);
    return () => window.removeEventListener('keydown', listner);
  }, [handleSubmit]);
  const handleCancel = () => {
    if (((changed || isUploading) && confirm(t('new_post.unsaved_confirmation'))) || !changed) {
      if (isUploading) abortController.current.abort();
      if (window.appData.historyLength > 1) {
        history.goBack();
      } else {
        history.replace('/');
      }
    }
  };

  const overrideTitle = useRef(true);
  const handleTitleChange = (e) => {
    overrideTitle.current = e.target.value === '';
    if (!changed) setChanged(true);
    setTitle(e.target.value);
  };

  const handleBodyChange = (e) => {
    if (!changed) setChanged(true);
    setBody(e.target.value);
  };
  const handleBodyPaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    if (body.trim() === '' && !isEditPost && isValidHttpUrl(paste) && overrideTitle.current) {
      setPostType('link');
      handleLinkChange({ target: { value: paste } });
      autoFillTitle(paste);
    }
  };

  const handleLinkChange = (e) => {
    if (!changed) setChanged(true);
    setLink(e.target.value);
  };
  const autoFillTitle = async (url) => {
    // overrideTitle.current = true;
    try {
      const res = await mfetchjson(`/api/_link_info?url=${encodeURIComponent(url)}`);
      setChanged(true);
      if (overrideTitle.current === true && res.title !== '') {
        setTitle(res.title);
        // Give React time to update the DOM with the new title
        setTimeout(() => {
          forceTextareaResize();
        }, 50);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Utility function to force textareas to resize
  const forceTextareaResize = () => {
    // Find all textareas with adjustable class
    const textareas = document.querySelectorAll('textarea.page-new-post-title');
    textareas.forEach(textarea => {
      // Reset height first
      textarea.style.height = 'auto';
      // Set the height based on scrollHeight
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  };
  const handleLinkPaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    if (isValidHttpUrl(paste) && overrideTitle.current) {
      autoFillTitle(paste);
    }
  };

  if (loading !== 'loaded') {
    return (
      <div className="page-new">
        <PageLoading text={t('new_post.converting_video')} />
      </div>
    );
  }

  const isImagePostsDisabled = import.meta.env.VITE_DISABLEIMAGEPOSTS === true;
  const isVideoPostsDisabled = import.meta.env.VITE_DISABLEVIDEOPOSTS === true;
  const maxVideoDuration = import.meta.env.VITE_MAXVIDEODURATION;

  return (
    <div className="page-new">
      <Helmet>
        <title>{isEditPost ? t("new_post.edit_post") : t("new_post.new_post")}</title>
      </Helmet>
      <div className="page-new-topbar">
        <div className="page-new-topbar-title">{isEditPost ? t("new_post.edit_post") : t("new_post.create_post")}</div>
        <ButtonClose onClick={handleCancel} />
      </div>
      <div className="page-new-content">
        <div className="page-new-content-post">
          <SelectCommunity
            onChange={handleCommunityChange}
            disabled={isEditPost}
            initial={community ? community.name : ''}
          />
          <div className="card page-new-form">
            {isPostingDisabled && (
              <div className="page-new-form-disabled">{getPostingDisabledText()}</div>
            )}
            <div
              className={clsx(
                'page-new-tabs',
                isImagePostsDisabled && ' is-two-tabs',
                !isVideoPostsDisabled && ' is-four-tabs',
                isPostingDisabled && 'is-disabled'
              )}
            >
              <button
                className={
                  'button-clear button-with-icon pn-tabs-item' +
                  (postType === 'text' ? ' is-selected' : '')
                }
                onClick={() => setPostType('text')}
                disabled={isPostingDisabled || isEditPost}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="currentColor"
                  className="page-new-icon-text"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z" />
                </svg>
                <span>{t("text")}</span>
              </button>
              {!isImagePostsDisabled && (
                <button
                  className={
                    'button-clear button-with-icon pn-tabs-item' +
                    (postType === 'image' ? ' is-selected' : '')
                  }
                  onClick={() => setPostType('image')}
                  disabled={isPostingDisabled || isEditPost}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="currentColor"
                    className="page-new-icon-image"
                  >
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                  </svg>
                  <span>{t("image")}</span>
                </button>
              )}
              {!isVideoPostsDisabled && (
                <button
                  className={
                    'button-clear button-with-icon pn-tabs-item' +
                    (postType === 'video' ? ' is-selected' : '')
                  }
                  onClick={() => setPostType('video')}
                  disabled={isPostingDisabled || isEditPost}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="var(--color-green)" className="size-6">
                    <path strokeLinecap='round' strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>

                  <span>{t("video")}</span>
                </button>
              )}
              <button
                className={
                  'button-clear button-with-icon pn-tabs-item' +
                  (postType === 'link' ? ' is-selected' : '')
                }
                onClick={() => setPostType('link')}
                disabled={isPostingDisabled || isEditPost}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="currentColor"
                  className="page-new-icon-link"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z" />
                </svg>
                <span>{t("link")}</span>
              </button>
            </div>
            <Textarea
              className="page-new-post-title"
              placeholder={t("new_post.instruction_1")}
              value={title}
              onChange={handleTitleChange}
              rows="1"
              adjustable
              disabled={isPostingDisabled}
            />
            {postType === 'text' && (
              <Textarea
                className="page-new-post-body"
                placeholder={t('post_content_placeholder')}
                value={body}
                onChange={handleBodyChange}
                onPaste={handleBodyPaste}
                adjustable
                disabled={isPostingDisabled || (isEditPost ? post.deletedContent : false)}
              />
            )}
            {postType === 'image' && (
              <div className="page-new-image-upload">
                {images.length > 0 &&
                  images.map((image) => (
                    <Image
                      key={image.id}
                      image={image}
                      onClose={() => deleteImage(image.id)}
                      disabled={isEditPost}
                    />
                  ))}
                {!isEditPost && !(post && post.deletedContent) && (
                  <ImageUploadArea
                    isUploading={isUploading}
                    onImagesUpload={handleImagesUpload}
                    disabled={images.length >= maxNumOfImages}
                  />
                )}
                {post && post.deletedContent && (
                  <div className="page-new-image-deleted flex flex-column flex-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                    </svg>
                    <p>{t("deleted_image")}</p>
                  </div>
                )}
              </div>
            )}
            {postType === 'link' && (
              <Textarea
                className="page-new-post-body"
                placeholder={t('new_post.paste_url')}
                value={link}
                onChange={handleLinkChange}
                onPaste={handleLinkPaste}
                adjustable
                disabled={isEditPost}
              />
            )}
            {postType === 'video' && (
              <div className="page-new-image-upload">
                {!isEditPost && !(post && post.deletedContent) && !video && (
                  <VidepUploadArea
                    isUploading={isUploading}
                    onVideoUpload={handleVideoUpload}
                  />
                )}
                {isEditPost && video && (
                  <img src={video.thumbnailURL} style={{ margin: 2, maxWidth: 500, maxHeight: 500, opacity: 0.5 }} />
                )}
                {videoThumbnails.length > 0
                  && (<div>
                    {t('new_post.video_thumbnail')}:<br />
                    <img src={videoThumbnails[videoThumbnailId]} style={{ margin: 2, maxWidth: 500, maxHeight: 500 }} />
                    <br />
                    {t('new_post.select_thumbnail')}:<br />
                    {videoThumbnails.map((thumb, i) => (
                      <img
                        key={`thumb-${i}`}
                        src={thumb}
                        style={{ width: 100, margin: 2, opacity: videoThumbnailId == i ? '100%' : '30%' }}
                        onClick={() => setVideoThumbnailId(i)} />
                    ))}
                  </div>)
                }
                {post && post.deletedContent && (
                  <div className="page-new-image-deleted flex flex-column flex-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                    </svg>
                    <p>{t("deleted_video")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {!isEditPost && (isUserMod || user.isAdmin) && (
            <div className="new-page-user-group">
              <AsUser isMod={isUserMod} onChange={(g) => setUserGroup(g)} />
            </div>
          )}
          <div className="new-page-help">
            <Link to="/markdown_guide" target="_blank">
              {t("new_post.markdown")}
            </Link>
            {' ' + t("new_post.markdown_desc") + ' '}
            <Link to="/markdown_guide" target="_blank">
              {t("instructions")}
            </Link>
          </div>
          <div className="page-new-buttons is-no-m">
            <button className="button-main" onClick={handleSubmit} disabled={isSubmitDisabled}>
              {t("submit")}
            </button>
            <button onClick={handleCancel}>{t("cancel")}</button>
          </div>
        </div>
        <div className="new-page-sidebar">
          {community && (
            <>
              <CommunityCard community={community} />
              <Rules rules={community.rules} communityName={community.name} unordered />
            </>
          )}
        </div>
        <div className="page-new-buttons is-m">
          <button className="button-main" onClick={handleSubmit} disabled={isSubmitDisabled}>
            {t("submit")}
          </button>
          <button onClick={handleCancel}>{t("cancel")}</button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;

const ImageUploadArea = ({ isUploading, onImagesUpload, disabled = false }) => {
  const [t, i18n] = useTranslation("global");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dropzoneRef = useRef();
  const handleOnDrop = (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      onImagesUpload(dt.files);
    }
  };

  const fileInputRef = useRef();
  const handleFileChange = () => {
    onImagesUpload(fileInputRef.current.files);
  };

  const handleAddPhoto = () => {
    fileInputRef.current.click();
  };

  // Prevent image load on missing drop-zone.
  useEffect(() => {
    const handleDrop = (e) => {
      if (!['TEXTAREA', 'INPUT'].includes(e.target.nodeName)) e.preventDefault();
    };
    const handleDragOver = (e) => e.preventDefault();
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (
    <div
      ref={dropzoneRef}
      className={
        'page-new-image-drop' +
        (isDraggingOver ? ' is-dropping' : '') +
        (disabled ? +' is-disabled' : '')
      }
      onClick={handleAddPhoto}
      onDragEnter={() => {
        setIsDraggingOver(true);
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDraggingOver(false);
        handleOnDrop(e);
      }}
    >
      <div className="page-new-image-text">
        {!disabled && !isUploading && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              name="image"
              style={{ visibility: 'hidden', width: 0, height: 0 }}
              onChange={handleFileChange}
              disabled={disabled}
            />
            <div>{t("new_post.add_photo")}</div>
            <div>{t("new_post.drag")}</div>
          </>
        )}
        {disabled && <div>{t('new_post.max')}</div>}
        {isUploading && (
          <div className="flex flex-center page-new-image-uploading">
            <div className="page-new-uploading-text">{t("new_post.uploading_image")}</div>
            <Spinner style={{ marginLeft: 5 }} size={25} />
          </div>
        )}
      </div>
    </div>
  );
};

ImageUploadArea.propTypes = {
  isUploading: PropTypes.bool.isRequired,
  onImagesUpload: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const VidepUploadArea = ({ isUploading, onVideoUpload }) => {
  const [t, i18n] = useTranslation("global");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dropzoneRef = useRef();
  const handleOnDrop = (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      onVideoUpload(dt.files);
    }
  };

  const fileInputRef = useRef();
  const handleFileChange = () => {
    onVideoUpload(fileInputRef.current.files);
  };

  const handleAddVideo = () => {
    fileInputRef.current.click();
  };

  // Prevent image load on missing drop-zone.
  useEffect(() => {
    const handleDrop = (e) => {
      if (!['TEXTAREA', 'INPUT'].includes(e.target.nodeName)) e.preventDefault();
    };
    const handleDragOver = (e) => e.preventDefault();
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (
    <div
      ref={dropzoneRef}
      className={
        'page-new-image-drop' +
        (isDraggingOver ? ' is-dropping' : '')
      }
      onClick={handleAddVideo}
      onDragEnter={() => {
        setIsDraggingOver(true);
      }}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDraggingOver(false);
        handleOnDrop(e);
      }}
    >
      <div className="page-new-image-text">
        {!isUploading && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              name="video"
              style={{ visibility: 'hidden', width: 0, height: 0 }}
              onChange={handleFileChange}
            />
            <div>{t('new_post.add_video')}</div>
            <div>{t('new_post.drag_video')}</div>
          </>
        )}
        {isUploading && (
          <div className="flex flex-center page-new-image-uploading">
            <div className="page-new-uploading-text">{t('new_post.uploading')}</div>
            <Spinner style={{ marginLeft: 5 }} size={25} />
          </div>
        )}
      </div>
    </div>
  );
};

VidepUploadArea.propTypes = {
  isUploading: PropTypes.bool.isRequired,
  onVideoUpload: PropTypes.func.isRequired,
};
function handleThumbChange(i) {
  setVideoThumbnailId(i)
}

function extractVideoFrames(file) {
  function extractFrame(video, canvas, offset) {
    return new Promise((resolve, reject) => {
      video.onseeked = event => {
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          resolve(canvas.toDataURL());
        }, "image/png");
      };
      video.currentTime = offset;
    });
  };

  async function serialExtractFrames(video, canvas, offsets) {
    var frames = [];
    var lastP = null;

    for (var offset of offsets) {
      if (offset < video.duration) {
        if (lastP) {
          var f = await lastP
          frames.push(f);
        }
        lastP = extractFrame(video, canvas, offset);
      }
    }
    if (lastP) {
      var f = await lastP;
      frames.push(f);
      lastP = null;
    }
    return frames;
  };

  return new Promise((resolve, reject) => {
    var vvid = document.createElement("video");
    var vcnv = document.createElement("canvas");
    vvid.onloadedmetadata = event => {
      vcnv.width = vvid.videoWidth;
      vcnv.height = vvid.videoHeight;
      const fNumerator = 30
      const fDenominator = 90
      const maxCaptureCount = 5
      let frOffsets = []
      if (vvid.duration) {
        for (let i = 0; i < maxCaptureCount; i++) {
          let captureInterval = fDenominator / fNumerator
          if (vvid.duration > captureInterval * i)
            frOffsets.push(captureInterval * i)
        }
        serialExtractFrames(vvid, vcnv, frOffsets).then(resp => {
          resolve({ thumbs: resp, width: vcnv.width, height: vcnv.height, duration: vvid.duration });
        })
      }
    }
    vvid.src = URL.createObjectURL(file);
  });
};

