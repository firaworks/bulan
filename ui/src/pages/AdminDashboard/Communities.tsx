import { useTranslation } from "react-i18next";

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PageLoading from '../../components/PageLoading';
import SimpleFeed, { SimpleFeedItem } from '../../components/SimpleFeed';
import { mfetchjson } from '../../helper';
import { useLoading } from '../../hooks';
import { Community } from '../../serverTypes';
import { snackAlertError } from '../../slices/mainSlice';

interface CommunitiesState {
  communities: Community[] | null;
  next: string | null;
}

export default function Communities() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [t] = useTranslation("global");
  const [loading, setLoading] = useLoading('loading');
  const [communitiesState, setCommunitiesState] = useState<CommunitiesState>({
    communities: null,
    next: null,
  });

  const sortCommunities = (items: Community[]): Community[] => {
    return items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  };

  const dispatch = useDispatch();
  useEffect(() => {
    const f = async () => {
      try {
        const res = (await mfetchjson('/api/communities')) as Community[];
        setCommunitiesState((prev) => {
          return {
            ...prev,
            communities: sortCommunities(res),
            next: null,
          };
        });
        setLoading('loaded');
      } catch (error) {
        dispatch(snackAlertError(error));
        setLoading('error');
      }
    };
    f();
  }, []);

  const handleRenderItem = (item: Community): React.ReactNode => {
    const community = item;
    return (
      <div className="feed-item-user">
        <Link to={`/${community.name}`}>{community.name}</Link>
      </div>
    );
  };

  if (loading !== 'loaded') {
    return <PageLoading />;
  }

  const feedItems: SimpleFeedItem<Community>[] = (communitiesState.communities || []).map(
    (community) => {
      return { item: community, key: community.id };
    }
  );

  return (
    <div className="dashboard-page-communities document">
      <h1>{t("communities")}</h1>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure provident beatae tenetur
        ducimus ullam mollitia quod labore, quisquam voluptas neque.
      </p>
      <p style={{ height: '200vh' }}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis, voluptas esse quos
        voluptatum sit beatae facilis reiciendis mollitia nesciunt consectetur corrupti molestiae
        iusto vitae nisi at laboriosam possimus autem quidem modi ex nobis expedita? Aliquam
        distinctio sunt tenetur explicabo vero.
      </p>
    </div>
  );
}
