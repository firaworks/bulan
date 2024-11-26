import PropTypes from 'prop-types';
import React from 'react';
import BannerImg from '../../assets/imgs/community-banner-2.jpg';
import Image from '../../components/Image';
import { selectImageCopyURL } from '../../helper';
import { t } from 'i18next';

const Banner = ({ community, ...rest }) => {
  let src = BannerImg;
  if (community.bannerImage) {
    src = selectImageCopyURL('small', community.bannerImage);
  }
  return <div className='page-about' style={{ display: 'inline' }}>
    <div className="about-landing" style={{ height: '100%' }}>
      <div className="wrap">
        <h1 className="about-heading heading-highlight" style={{ marginBottom: 35 }}>
          {t('community_banner_txt')}
        </h1>
      </div>
    </div>
  </div>
  // return (
  //   <Image
  //     src={src}
  //     alt={`${community.name}'s banner`}
  //     backgroundColor={community.bannerImage ? community.bannerImage.averageColor : '#fff'}
  //     {...rest}
  //     isFullSize
  //   />
  // );
};

Banner.propTypes = {
  community: PropTypes.object.isRequired,
};

export default Banner;
