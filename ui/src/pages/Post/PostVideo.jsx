import PropTypes from 'prop-types';
import { useIsMobile } from '../../hooks';
import React, { useEffect, useRef } from 'react';
import hls from "hls.js";
import VideoPlayer from '../../components/PostCard/VideoPlayer';

// {
//   "id": "18107aae643bae60958f8bed",
//   "s3Path": null,
//   "cmafPath": {
//     "String": "https://cdn.bulan.mn/v/20241212/18107aae643bae60958f8bed.m3u8",
//     "Valid": true
//   },
//   "format": ".mp4",
//   "thumbnailID": 0,
//   "thumbnailURL": "https://cdn.bulan.mn/t/20241212/18107aae643bae60958f8bed.0000000.jpg"
// }


const PostVideo = ({ post }) => {
  const { video } = post;
  const ar = calcAspectRatio(video.width, video.height)

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    loop: true,
    fluid: true,
    disablePictureInPicture: true,
    aspectRatio: ar,
    poster: video.thumbnailURL,
    sources: [{
      src: video.cmafPath.String,
      type: 'application/x-mpegURL'
    }],
  };

  return <div className='post-video'>
    <div className={video.width > video.height ? 'video-landscape' : 'video-portrait'}>
      <VideoPlayer {...videoJsOptions} />
    </div>
  </div>
};
function calcAspectRatio(w, h) {
  const r = gcd(w, h);
  return `${w / r}:${h / r}`
}
function gcd(a, b) {
  return (b == 0) ? a : gcd(b, a % b);
}

PostVideo.propTypes = {
  post: PropTypes.object.isRequired,
};

export default PostVideo;
