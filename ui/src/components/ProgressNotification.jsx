import React, { useState, useEffect } from 'react';
import { ButtonClose } from './Button';

// Icons components for better organization
const LoadingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const SuccessIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Progress bar component
const ProgressBar = ({ value }) => (
    <div className="progress-bar-bg">
        <div
            className="progress-bar-fill"
            style={{ width: `${value}%` }}
        ></div>
    </div>
);

// Status icon component
const StatusIcon = ({ status }) => {
    if (status === 'submitting') {
        return (
            <div className="status-icon processing">
                <LoadingIcon />
            </div>
        );
    } else if (status === 'success') {
        return (
            <div className="status-icon success">
                <SuccessIcon />
            </div>
        );
    } else {
        return (
            <div className="status-icon error">
                <ErrorIcon />
            </div>
        );
    }
};

// A general-purpose progress notification component
export const ProgressNotification = ({
    // Required props
    title,
    processId,
    fetchProgressFn,

    // Optional props with defaults
    onClose = () => { },
    autoCloseDelay = 3000,
    position = 'bottom-left',
    width = 300,

    // Customizable messages
    statusMessages = {
        progress: {
            0: 'Starting...',
            25: 'Processing...',
            50: 'Halfway there...',
            75: 'Almost done...',
            90: 'Finalizing...'
        },
        success: 'Completed successfully!',
        error: 'Process failed'
    }
}) => {
    const [status, setStatus] = useState('submitting'); // submitting, success, error
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    // Start tracking progress when component mounts
    useEffect(() => {
        const trackProgress = async () => {
            try {
                // Custom function to poll progress
                await fetchProgressFn(processId, updateProgress);
                setStatus('success');

                // Auto-close after success
                setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);
            } catch (err) {
                setStatus('error');
                setError(err.message || 'An error occurred');
            }
        };

        trackProgress();
    }, [processId, fetchProgressFn, autoCloseDelay]);

    // Update progress callback
    const updateProgress = (progressValue) => {
        setProgress(progressValue);
    };

    // Handle closing the notification
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Allow time for exit animation
    };

    // Get appropriate status message based on progress
    const getStatusMessage = () => {
        const thresholds = Object.keys(statusMessages.progress)
            .map(Number)
            .sort((a, b) => a - b);

        // Find the highest threshold that is lower than or equal to current progress
        const applicableThreshold = thresholds
            .filter(threshold => threshold <= progress)
            .pop() || thresholds[0];

        return statusMessages.progress[applicableThreshold];
    };

    // Early return if not visible
    if (!isVisible) return null;

    // Get position style
    const getPositionClass = () => {
        switch (position) {
            case 'top-left': return 'position-top-left';
            case 'top-center': return 'position-top-center';
            case 'bottom-left': return 'position-bottom-left';
            case 'bottom-right': return 'position-bottom-right';
            case 'bottom-center': return 'position-bottom-center';
            case 'top-right':
            default: return 'position-top-right';
        }
    };

    const notificationClassName = `progress-notification ${getPositionClass()} ${isVisible ? 'visible' : 'hidden'}`;

    return (
        <div
            className={notificationClassName}
            style={{ width: `${width}px` }}
        >
            <div className="notification-content">
                <div className="notification-header">
                    <div className="title-container">
                        <StatusIcon status={status} />
                        <h3 className="notification-title">{title}</h3>
                    </div>
                    <ButtonClose onClick={handleClose} />
                </div>

                {status === 'submitting' && (
                    <div className="progress-container">
                        <ProgressBar value={progress} />
                        <div className="progress-details">
                            <span className="progress-status">{getStatusMessage()}</span>
                            <span className="progress-percentage">{progress}%</span>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="success-container">
                        <div className="status-message success">
                            {statusMessages.success}
                        </div>
                        {statusMessages.actionUrl && (
                            <button
                                className="action-button"
                                onClick={() => {
                                    // Navigate to the specified URL
                                    window.location.href = statusMessages.actionUrl;
                                    // Close the notification
                                    handleClose();
                                }}
                            >
                                {statusMessages.actionLabel || "View"}
                            </button>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div className="error-container">
                        <div className="status-message error">
                            {statusMessages.error}
                        </div>
                        <div className="error-details">
                            {error || "An unexpected error occurred."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressNotification;