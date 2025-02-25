import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { adjustTextareaHeight, APIError, mfetch } from '../../helper';
import {
  bannedFromAdded,
  loginPromptToggled,
  snackAlert,
  snackAlertError,
} from '../../slices/mainSlice';
import AsUser from './AsUser';
import { useTranslation } from 'react-i18next';
import SelectMentionedUser from './SelectMentionedUser';

const AddComment = ({
  isMod = false,
  editing = false,
  id,
  post,
  parentCommentId = null,
  onSuccess,
  onCancel,
  commentBody = '',
  main = false,
  loggedIn = true,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");
  const [body, setBody] = useState(commentBody);
  const empty = body.length === 0;

  const postId = post.publicId;
  const commentsObj = useSelector((state) => state.comments.items[postId]);
  const commenters = commentsObj ? commentsObj.commenters : [];

  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [partialUsername, setPartialUsername] = useState('');
  const [cursorPosX, setCursorPosX] = useState(0);
  const [cursorPosY, setCursorPosY] = useState(0);

  const [userGroup, setUserGroup] = useState('normal');

  const [clicked, setClicked] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const timer = useRef(null);

  const textareaNode = useRef();
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setClicked(false);
    setSendingRequest(false);
    setBody('');
    if (textareaNode.current) {
      textareaNode.current.style.height = 'auto';
      textareaNode.current.blur();
    }
  };

  const handleSubmit = async () => {
    if (empty) {
      dispatch(snackAlert(t("new_comment.alert_1")));
      return;
    }
    setSendingRequest(true);
    try {
      let res;
      if (editing) {
        res = await mfetch(`/api/posts/${postId}/comments/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ body: body }),
        });
      } else {
        res = await mfetch(`/api/posts/${postId}/comments?userGroup=${userGroup}`, {
          method: 'POST',
          body: JSON.stringify({
            parentCommentId,
            body,
          }),
        });
      }
      if (!res.ok) {
        if (res.status === 403) {
          const json = await res.json();
          if (json.code === 'banned_from_community') {
            alert(t("new_comment.alert_2"));
            dispatch(bannedFromAdded(post.communityId));
            return;
          }
        } else if (res.status === 429) {
          // Try again in 2 seconds.
          timer.current = setTimeout(handleSubmit, 2000);
          return;
        }
        throw new APIError(res.status, await res.json());
      }
      const comm = await res.json();
      reset();
      onSuccess(comm);
    } catch (error) {
      dispatch(snackAlertError(error));
      setSendingRequest(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    } else if (onCancel && e.key === 'Escape' && body === '') {
      onCancel();
    }
  };

  const textareaRef = useRef();
  const textareaCallbackRef = useCallback((node) => {
    if (node !== null) {
      if (!main) node.focus();
      adjustTextareaHeight({ target: node }, 4);
      textareaNode.current = node;
      textareaRef.current = node;
    }
  }, []);

  const handleTextareaClick = () => {
    if (!loggedIn) {
      textareaRef.current.blur();
      dispatch(loginPromptToggled());
      return;
    }
    if (!clicked) setClicked(true);
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  const calcCursorPos = (e) => {
    const containerEle = e.parentElement;
    const mirroredEle = document.createElement('div');
    mirroredEle.textContent = e.value;
    containerEle.append(mirroredEle);
    const textareaStyles = window.getComputedStyle(e);
    [
      'border',
      'boxSizing',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'lineHeight',
      'padding',
      'textDecoration',
      'textIndent',
      'textTransform',
      'whiteSpace',
      'wordSpacing',
      'wordWrap',
    ].forEach((property) => {
      mirroredEle.style[property] = textareaStyles[property];
    });
    // mirroredEle.style.borderColor = 'transparent';
    mirroredEle.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        white-space: pre-wrap;
        color: transparent;
        borderColor: transparent;
    `;
    const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;
    const borderWidth = parseValue(textareaStyles.borderWidth);
    const cursorPos = e.selectionStart;
    const textBeforeCursor = e.value.substring(0, cursorPos);
    const textAfterCursor = e.value.substring(cursorPos);
    const pre = document.createTextNode(textBeforeCursor);
    const post = document.createTextNode(textAfterCursor);
    const caretEle = document.createElement('span');
    caretEle.style.cssText = `
      position: relative;
      top: 0;
      left: 0;
      visibility: hidden;
      whiteSpace: pre;
      font: inherit; // Inherit font from textarea
    `;
    caretEle.innerHTML = '&nbsp;';
    mirroredEle.innerHTML = '';
    mirroredEle.append(pre, caretEle, post);
    const rect = caretEle.getBoundingClientRect();
    const posY = caretEle.offsetTop
    const posX = caretEle.offsetLeft + 20
    containerEle.removeChild(mirroredEle)
    return { posX, posY }
  }

  const handleInput = (e) => {
    const textarea = e.target
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const atIndex = text.lastIndexOf('@'); // Find the last @ symbol
    if (atIndex !== -1) {
      // Check if it's a valid mention (character before and after)
      const charBefore = atIndex > 0 ? text[atIndex - 1] : ''; // Character before @
      const charAfter = cursorPosition < text.length ? text[cursorPosition] : ''; // Character after

      const isValidMention = (charBefore === '' || /\s/.test(charBefore)) && // Before @ is whitespace or start of line
        text.substring(atIndex).match(/\s/) == null

      if (isValidMention) {
        const mentioningPartialUsername = text.substring(atIndex + 1);
        setPartialUsername(mentioningPartialUsername)
        const caretPos = calcCursorPos(textarea)
        setCursorPosX(caretPos.posX)
        setCursorPosY(caretPos.posY)
        setIsSuggestionOpen(true)
      } else {
        setIsSuggestionOpen(false)
      }
    } else {
      setIsSuggestionOpen(false)
    }
  };

  const handleSuggestionSelect = (e) => {
    const textarea = textareaRef.current
    const text = textarea.value;
    const atIndex = text.lastIndexOf('@') // Find the last @ symbol
    const mentioningPartialUsername = text.substring(atIndex + 1)
    const newText = text.substring(0, atIndex + 1) + e.username + ' ' // Replace with full name + space
    setBody(newText)
    setPartialUsername('')
    setIsSuggestionOpen(false)
    // Set cursor position after the inserted name
    textarea.selectionStart = atIndex + e.username.length + 2; // +2 for @ and space
    textarea.selectionEnd = textarea.selectionStart;
    textarea.focus(); //Refocus on the textarea
  }

  return (
    <div className={'post-comments-new' + (editing ? ' is-editing' : '')}>
      <textarea
        ref={textareaCallbackRef}
        name=""
        id=""
        rows="3"
        placeholder={t("new_comment.add")}
        value={body}
        onKeyDown={handleKeyDown}
        onClick={handleTextareaClick}
        disabled={disabled || sendingRequest}
        onInput={(e) => {
          adjustTextareaHeight(e, 4 /* border size */)
          handleInput(e)
        }}
        onChange={(e) => setBody(e.target.value)}
      ></textarea>
      <SelectMentionedUser open={isSuggestionOpen} partialUsername={partialUsername} commenters={commenters} posX={cursorPosX} posY={cursorPosY} onSelect={handleSuggestionSelect} />
      {(!main || (main && clicked)) && (
        <div className="post-comments-new-buttons">
          <Link className="button button-icon-simple" to="/markdown_guide" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </Link>
          <AsUser isMod={isMod} disabled={sendingRequest} onChange={(g) => setUserGroup(g)} />
          <div className="post-comments-new-buttons-buttons">
            <button onClick={handleCancel}>{t("cancel")}</button>
            <button
              className="button-main"
              onClick={handleSubmit}
              disabled={empty || sendingRequest}
            >
              {editing ? t('update_comment') : t('add_comment')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

AddComment.propTypes = {
  post: PropTypes.object.isRequired,
  parentCommentId: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  editing: PropTypes.bool,
  id: PropTypes.string,
  commentBody: PropTypes.string,
  main: PropTypes.bool,
  loggedIn: PropTypes.bool,
  disabled: PropTypes.bool,
  isMod: PropTypes.bool,
};

export default AddComment;
