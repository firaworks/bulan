import React, { useState } from 'react';
import { ProgressNotification } from './ProgressNotification';
import { useTranslation } from 'react-i18next';

// Specialized component for video post submissions
export const VideoProgressNotification = ({ videoId, onClose }) => {
    const [t, i18n] = useTranslation("global");
    const [progress, setProgress] = useState(0);
    const [postUrl, setPostUrl] = useState('');
    // Custom progress fetching function for video uploads
    const fetchVideoProgress = async (videoId, updateProgress) => {
        try {
            // The video is already uploaded to AWS S3 and the processing job has been started,
            // so we don't need to initiate processing - we just need to poll for status

            // Poll progress based on the videoID directly using your backend's getVideoStatus endpoint
            return new Promise((resolve, reject) => {
                if (progress == 100) {
                    resolve();
                    return
                }
                const checkProgress = async () => {
                    try {
                        const response = await fetch(`/api/video/status/${videoId}`, {
                            method: 'GET',
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to fetch video status');
                        }

                        const { progress, status, title, postUrl } = await response.json();

                        updateProgress(progress);
                        setProgress(progress)
                        setPostUrl(postUrl)
                        if (status === 'COMPLETE') {
                            resolve();
                            return;
                        }

                        if (status === 'ERROR') {
                            reject(new Error('Video processing failed'));
                            return;
                        }

                        // Continue polling (every 3 seconds to avoid too many requests)
                        setTimeout(checkProgress, 3000);
                    } catch (error) {
                        reject(error);
                    }
                };

                // Start the polling
                checkProgress();
            });
        } catch (error) {
            console.error('Error monitoring video processing:', error);
            throw error;
        }
    };

    return (
        <ProgressNotification
            title={t('new_post.video_processing')}
            processId={videoId}
            fetchProgressFn={(processId, updateProgress) => fetchVideoProgress(processId, updateProgress)}
            onClose={onClose}
            autoCloseDelay={60000}
            statusMessages={{
                progress: {
                    0: t('new_post.video_progress_queued'),
                    5: t('new_post.video_progress_converting'),
                    25: t('new_post.video_progress_streams'),
                    50: t('new_post.video_progress_thumbs'),
                    75: t('new_post.video_progress_finalizing'),
                },
                success: t('new_post.video_progress_success'),
                error: t('new_post.video_progress_error'),
                actionUrl: postUrl, // URL to view the video post
                actionLabel: t('view')
            }}
        />
    );
};

// Example of a file upload progress notification
export const FileUploadProgressNotification = ({ fileId, fileData, onClose }) => {
    // Custom progress fetching function for file uploads
    const fetchFileProgress = async (fileId, updateProgress) => {
        try {
            // Initial API call to start processing
            const response = await fetch('/api/files/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileId,
                    ...fileData
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to start file processing');
            }

            const { processId } = await response.json();

            // Poll progress (similar structure to video progress)
            return new Promise((resolve, reject) => {
                const checkProgress = async () => {
                    try {
                        const response = await fetch(`/api/files/progress/${processId}`, {
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to fetch progress');
                        }

                        const { progress, status } = await response.json();

                        updateProgress(progress);

                        if (status === 'completed') {
                            resolve();
                            return;
                        }

                        if (status === 'failed') {
                            reject(new Error('File processing failed'));
                            return;
                        }

                        // Continue polling
                        setTimeout(checkProgress, 1000);
                    } catch (error) {
                        reject(error);
                    }
                };

                checkProgress();
            });
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    };

    return (
        <ProgressNotification
            title="File Upload"
            processId={fileId}
            fetchProgressFn={(processId, updateProgress) => fetchFileProgress(processId, updateProgress)}
            onClose={onClose}
            statusMessages={{
                progress: {
                    0: "Preparing file...",
                    25: "Uploading...",
                    50: "Processing...",
                    75: "Validating...",
                    90: "Finishing up..."
                },
                success: "File uploaded successfully!",
                error: "Upload failed"
            }}
            position="bottom-right"
        />
    );
};

// Example of a data export progress notification
export const DataExportProgressNotification = ({ exportId, exportConfig, onClose }) => {
    // Custom progress fetching function for data exports
    const fetchExportProgress = async (exportId, updateProgress) => {
        try {
            // Initial API call to start the export
            const response = await fetch('/api/exports/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exportId,
                    ...exportConfig
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to start export');
            }

            const { jobId } = await response.json();

            // Poll progress
            return new Promise((resolve, reject) => {
                const checkProgress = async () => {
                    try {
                        const response = await fetch(`/api/exports/status/${jobId}`, {
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to fetch export status');
                        }

                        const { progress, status, downloadUrl } = await response.json();

                        updateProgress(progress);

                        if (status === 'completed') {
                            // You could store the downloadUrl in a ref or state if needed
                            resolve(downloadUrl);
                            return;
                        }

                        if (status === 'failed') {
                            reject(new Error('Export failed'));
                            return;
                        }

                        // Continue polling
                        setTimeout(checkProgress, 1500);
                    } catch (error) {
                        reject(error);
                    }
                };

                checkProgress();
            });
        } catch (error) {
            console.error('Error during export:', error);
            throw error;
        }
    };

    return (
        <ProgressNotification
            title="Data Export"
            processId={exportId}
            fetchProgressFn={(processId, updateProgress) => fetchExportProgress(processId, updateProgress)}
            onClose={onClose}
            statusMessages={{
                progress: {
                    0: "Preparing data...",
                    20: "Querying database...",
                    40: "Formatting data...",
                    60: "Generating file...",
                    80: "Finalizing export...",
                    95: "Preparing download..."
                },
                success: "Export complete! Your file is ready.",
                error: "Export failed"
            }}
            position="bottom-center"
            width={350}
            autoCloseDelay={5000}
        />
    );
};

// Demo component showing multiple types of notifications
export const ProgressNotificationsDemo = () => {
    const [showVideoProgress, setShowVideoProgress] = useState(false);
    const [videoData, setVideoData] = useState(null);

    const [showFileProgress, setShowFileProgress] = useState(false);
    const [fileData, setFileData] = useState(null);

    const [showExportProgress, setShowExportProgress] = useState(false);
    const [exportData, setExportData] = useState(null);

    // Simulate a video submission
    const handleVideoSubmitted = () => {
        setVideoData({
            videoId: '182A80B6768E7200E93C41FE',
            // videoId: '181D5e4AE8A3338059F26459',
            metadata: { title: 'Sample Video', description: 'Video description' }
        });
        setShowVideoProgress(true);
    };

    // Simulate a file upload
    const handleFileUploaded = () => {
        setFileData({
            fileId: 'file-' + Date.now(),
            fileData: { name: 'sample.pdf', size: '2.5MB' }
        });
        setShowFileProgress(true);
    };

    // Simulate a data export
    const handleDataExport = () => {
        setExportData({
            exportId: 'export-' + Date.now(),
            exportConfig: { format: 'csv', includeMetadata: true }
        });
        setShowExportProgress(true);
    };

    return (
        <div className="demo-container">
            <h1>Progress Notifications Demo</h1>
            <div className="button-group">
                <button className="demo-button" onClick={handleVideoSubmitted}>
                    Simulate Video Submission
                </button>
                <button className="demo-button" onClick={handleFileUploaded}>
                    Simulate File Upload
                </button>
                <button className="demo-button" onClick={handleDataExport}>
                    Simulate Data Export
                </button>
            </div>

            {/* Video progress notification */}
            {showVideoProgress && videoData && (
                <VideoProgressNotification
                    videoId={videoData.videoId}
                    metadata={videoData.metadata}
                    onClose={() => setShowVideoProgress(false)}
                />
            )}

            {/* File upload progress notification */}
            {showFileProgress && fileData && (
                <FileUploadProgressNotification
                    fileId={fileData.fileId}
                    fileData={fileData.fileData}
                    onClose={() => setShowFileProgress(false)}
                />
            )}

            {/* Data export progress notification */}
            {showExportProgress && exportData && (
                <DataExportProgressNotification
                    exportId={exportData.exportId}
                    exportConfig={exportData.exportConfig}
                    onClose={() => setShowExportProgress(false)}
                />
            )}

            <style jsx>{`
        .demo-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .demo-button {
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .demo-button:hover {
          background-color: #2563eb;
        }
      `}</style>
        </div>
    );
};
