import clsx from 'clsx';
import PropTypes from 'prop-types';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number;
  color?: string;
  text?: string;
}

const Spinner = ({ className, size, color, text, ...props }: SpinnerProps) => {
  return (
    <div className={clsx('spinner-wrapper', className)} {...props}>
      <div style={{ display: 'inline-grid', justifyItems: 'center' }}>
        <svg
          className="spinner"
          viewBox="0 0 50 50"
          style={{ width: size ?? undefined, height: size ?? undefined, stroke: color }}
        >
          <circle
            style={{ stroke: color }}
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
        <span>
          {text}
        </span>
      </div>
    </div>
  );
};

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Spinner;
