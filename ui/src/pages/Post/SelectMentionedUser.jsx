import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { kRound, mfetchjson, selectImageCopyURL } from '../../helper';
import { useDelayedEffect, useQuery } from '../../hooks';
import { snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

const SelectMentionedUser = ({ open = false, partialUsername = '', selected = false, commenters = [], posX = 0, posY = 0, onSelect }) => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation("global");
  const [suggestions, setSuggestions] = useState([]);

  useDelayedEffect(
    useCallback(() => {
      const sorted = commenters.sort((a, b) => a.username.localeCompare(b.username))
      const filtered = sorted.filter(user =>
        user.username.toLowerCase().startsWith(partialUsername.toLowerCase())
      );
      setSuggestions(filtered);
    }, [partialUsername]),
    10
  );

  const [index, _setIndex] = useState(-1);
  const setIndex = (down = true) => {
    _setIndex((i) => {
      if (i === -1) return 0;
      let ni = i + (down ? 1 : -1);
      if (down && ni >= suggestions.length) {
        ni = 0;
      } else if (ni <= -1) {
        ni = suggestions.length - 1;
      }
      return ni;
    });
  };
  useEffect(() => {
    _setIndex(-1);
  }, [focus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setIndex(!e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      setIndex(!e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      setIndex(e.shiftKey);
    } else if (e.key === 'Enter') {
      let selected = index;
      if (suggestions.length === 1) selected = 0;
      if (selected !== -1) {
        _setIndex(-1);
        // setValue(suggestions[selected].name);
        // setFocus(false);
        document.querySelector('textarea').focus();
        onSelect(suggestions[selected]);
      }
    } else if (e.key === 'Escape') {
      // setFocus(false);
    }
  };

  const ref = useRef(null);
  useEffect(() => {
    const onBodyClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        // setFocus(false);
      }
    };
    document.addEventListener('click', onBodyClick);
    return () => {
      document.removeEventListener('click', onBodyClick);
    };
  }, []);
  const handleSuggestClick = (suggestion) => {
    // setValue(suggestion.name);
    onSelect(suggestion);
  };

  return (
    <div>
      {open && commenters.length > 0 && (
        <div className='user-mention' ref={ref}>
          <div className="user-mention-suggest"
            style={{ left: posX + 'px', top: posY + 'px' }}>
            {suggestions.map((s, i) => (
              <div
                role="button"
                tabIndex={0}
                className={'user-mention-suggest-item' + (i === index ? ' is-hovering' : '')}
                key={i}
                onClick={() => handleSuggestClick(s)}
              >
                <img
                  src={
                    s.proPic
                      ? selectImageCopyURL('tiny', s.proPic)
                      : 'src/assets/imgs/favicon.png'
                  }
                  className="profile-picture"
                  alt=""
                />
                <div className="user-mention-suggest-name">{s.username}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SelectMentionedUser.propTypes = {
  partialUsername: PropTypes.string,
  selected: PropTypes.bool,
  commenters: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  // onFocus: PropTypes.func,
};

export default SelectMentionedUser;
