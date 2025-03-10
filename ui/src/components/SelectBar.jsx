import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { feedLayoutChanged } from '../slices/mainSlice';
import { SVGSettings } from '../SVGs';
import Button from './Button';
import Dropdown from './Dropdown';
import { useTranslation } from 'react-i18next';



const SelectBar = ({ name, options, value, onChange, ...rest }) => {
  const [t, i18n] = useTranslation("global");

  const layoutOptions = [
    { text: t('layout_card'), id: 'card' },
    { text: t('layout_compact'), id: 'compact' },
  ]

  const handleClick = (value) => {
    if (onChange) {
      onChange(value);
    }
  };
  const handleMouseUp = (event, value) => {
    if (event.button === 1) {
      // Third mouse button click
      window.open(`/?sort=${value}`, '_blank');
    }
  };

  const dispatch = useDispatch();
  const handleLayoutClick = (value) => {
    dispatch(feedLayoutChanged(value));
  };



  const text = options.filter((opt) => opt.id === value)[0].text;
  return (
    <nav className="select-bar">
      <div className="left">
        <div className="select-bar-name">{name}</div>
      </div>
      <div className="right">
        <Dropdown target={<button className="select-bar-dp-target">{t("select_bar.sort") + " " + text}</button>}>
          <div className="dropdown-list">
            {options.map((option) => (
              <div
                className="dropdown-item"
                key={option.id}
                onClick={() => handleClick(option.id)}
                onMouseUp={(event) => handleMouseUp(event, option.id)}
              >
                {option.text}
              </div>
            ))}
          </div>
        </Dropdown>
        <Dropdown target={<Button icon={<SVGSettings />}></Button>} aligned="right">
          <div className="dropdown-list">
            {layoutOptions.map((option) => (
              <div
                className="dropdown-item"
                key={option.id}
                onClick={() => handleLayoutClick(option.id)}
              >
                {option.text}
              </div>
            ))}
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

SelectBar.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default SelectBar;
