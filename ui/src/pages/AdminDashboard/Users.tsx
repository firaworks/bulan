import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import PageLoading from '../../components/PageLoading';
import SimpleFeed, { SimpleFeedItem } from '../../components/SimpleFeed';
import TimeAgo from '../../components/TimeAgo';
import { mfetchjson } from '../../helper';
import { useLoading } from '../../hooks';
import { User } from '../../serverTypes';
import { snackAlertError } from '../../slices/mainSlice';
import { useTranslation } from 'react-i18next';

interface UsersState {
  users: User[] | null;
  next: string | null;
}

export default function Users() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [t] = useTranslation("global");
  const [loading, setLoading] = useLoading('loading');
  const [usersState, setUsersState] = useState<UsersState>({ users: null, next: null });

  const dispatch = useDispatch();
  useEffect(() => {
    const f = async () => {
      try {
        const res = await fetchUsers();
        setUsersState(res);
        setLoading('loaded');
      } catch (error) {
        dispatch(snackAlertError(error));
        setLoading('error');
      }
    };
    f();
  }, []);

  const [nextUsersLoading, setNextUsersLoading] = useState(false);
  const fetchNextUsers = async () => {
    if (nextUsersLoading || !usersState.next) return;
    try {
      setNextUsersLoading(true);
      const res = await fetchUsers(usersState.next);
      setUsersState((prev) => {
        return {
          users: [...prev.users!, ...(res.users || [])],
          next: res.next,
        };
      });
    } catch (error) {
      dispatch(snackAlertError(error));
    } finally {
      setNextUsersLoading(false);
    }
  };

  const handleRenderItem = (item: User) => {
    const user = item;
    return (
      <div className="feed-item-user">
        <Link to={`/@${user.username}`}>@{user.username}</Link>
        <div className="feed-item-user-is-banned">
          {user.isBanned ? 'Banned' : user.deleted ? 'Deleted' : ''}
        </div>
        <TimeAgo time={user.createdAt} />
      </div>
    );
  };

  if (loading !== 'loaded') {
    return <PageLoading text="" />;
  }

  const feedItems: SimpleFeedItem<User>[] = [];
  usersState.users!.forEach((user) => feedItems.push({ item: user, key: user.id }));

  return (
    <div className="dashboard-page-users document">
      <div className="dashboard-page-title">Users</div>
      <div className="dashboard-page-content">
        <SimpleFeed items={feedItems} onRenderItem={handleRenderItem} />
        <Button className="is-more-button" loading={nextUsersLoading} onClick={fetchNextUsers}>
          {t('other')}
        </Button>
      </div>
    </div>
  );
}

async function fetchUsers(next?: string): Promise<UsersState> {
  return mfetchjson('/api/users' + (next ? `?next=${next}` : ''));
}
