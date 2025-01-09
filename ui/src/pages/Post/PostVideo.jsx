import PropTypes from 'prop-types';
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

  let w = '16'
  let h = '9'
  let ar = '16:9'
  let arCss = '169'
  if (video.width && video.height) {
    let asp = calcAspectRatio(video.width, video.height)

    w = asp.w
    h = asp.h
  } else {
    video.width = 640
    video.height = 360
  }
  const supportedAspectRatios =
    ['16/9',
      '5/4',
      '4/3',
      '1/1',
      '9/16',
      '4/5',
      '3/4']
  if (-1 === supportedAspectRatios.indexOf(`${w}/${h}`)) {
    w = '1'; h = '1'
  }
  ar = `${w}:${h}`
  arCss = `${w}${h}`

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
    <div className={(video.width > video.height ? 'video-landscape' : 'video-portrait') + ' ' + `video-${arCss}`}>
      <VideoPlayer {...videoJsOptions} />
    </div>
  </div>
};
function calcAspectRatio(w, h) {
  const r = gcd(w, h);
  return { w: w / r, h: h / r }
}
function gcd(a, b) {
  return (b == 0) ? a : gcd(b, a % b);
}

PostVideo.propTypes = {
  post: PropTypes.object.isRequired,
};

export default PostVideo;
