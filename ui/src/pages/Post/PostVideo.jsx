import PropTypes from 'prop-types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';

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
  // console.log(video)
  return <MediaPlayer
    title={post.title}
    src={video.cmafPath.String}
    streamType="on-demand"
    load="play" posterLoad="visible">
    <MediaProvider >
      <Poster src={video.thumbnailURL} alt={post.title} />
    </MediaProvider>
    <PlyrLayout icons={plyrLayoutIcons} />
  </MediaPlayer>
};

PostVideo.propTypes = {
  post: PropTypes.object.isRequired,
};

export default PostVideo;
