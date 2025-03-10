import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-mobile-ui/dist/videojs-mobile-ui.css';
import 'videojs-mobile-ui';
import '@videojs/themes/dist/sea/index.css';
// import './VideoPlayer.css'; // Our custom CSS file

export default class VideoPlayer extends React.Component {
  componentDidMount() {
    // Configure player with custom control bar layout
    const playerOptions = {
      ...this.props,
      controlBar: {
        children: [
          'playToggle',
          'progressControl',
          'currentTimeDisplay', // Add current time
          'timeDivider',        // Add time divider (/)
          'durationDisplay',    // Add total duration
          'fullscreenToggle',
          'muteToggle'
        ]
      }
    };

    this.player = videojs(this.videoNode, playerOptions, () => {
      this.videoNode.classList.add('video-player');
      this.player.on('fullscreenchange', () => {
        if (this.player.isFullscreen_) {
          this.videoNode.parentElement.classList.add('video-port-full');
        } else {
          this.videoNode.parentElement.classList.remove('video-port-full');
        }
      });
      this.player.on('pause', () => {
        this.props.paused(this.videoNode);
      });
      this.player.on('play', () => {
        this.props.played(this.videoNode);
      });
    });
    this.player.mobileUi();
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div data-vjs-player>
        <video ref={node => this.videoNode = node} className="video-js vjs-theme-sea bulan-video-player"></video>
      </div>
    );
  }
}