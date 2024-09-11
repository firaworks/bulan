import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { APIError, mfetch } from '../../helper';
import { communityAdded, selectCommunity } from '../../slices/communitiesSlice';
import { snackAlertError } from '../../slices/mainSlice';
import Forbidden from '../Forbidden';
import PageNotLoaded from '../PageNotLoaded';
import Banned from './Banned';
import Mods from './Mods';
import Removed from './Removed';
import Reports from './Reports';
import Rules from './Rules';
import Settings from './Settings';
import { useTranslation } from 'react-i18next';

function isActiveCls(className, isActive, activeClass = 'is-active') {
  return className + (isActive ? ` ${activeClass}` : '');
}

const Modtools = () => {
  const [t, i18n] = useTranslation("global");
  const dispatch = useDispatch();
  const { name: communityName } = useParams();

  const user = useSelector((state) => state.main.user);

  const community = useSelector(selectCommunity(communityName));
  const [loading, setLoading] = useState(community ? 'loaded' : 'loading');
  useEffect(() => {
    if (community) return;
    (async () => {
      setLoading('loading');
      try {
        const res = await mfetch(`/api/communities/${communityName}?byName=true`);
        if (!res.ok) {
          if (res.status === 404) {
            setLoading('notfound');
            return;
          }
          throw new APIError(res.status, await res.json());
        }
        const rcomm = await res.json();
        dispatch(communityAdded(rcomm));
        setLoading('loaded');
      } catch (error) {
        setLoading('error');
        dispatch(snackAlertError(error));
      }
    })();
  }, [name, community]);

  let { path } = useRouteMatch();
  const { pathname } = useLocation();

  if (loading !== 'loaded') {
    return <PageNotLoaded loading={loading} />;
  }

  if (!(community.userMod || (user && user.isAdmin))) {
    return <Forbidden />;
  }

  return (
    <div className="page-content wrap modtools">
      <Helmet>
        <title>{t("mod.data.modtools")}</title>
      </Helmet>
      <Sidebar />
      <div className="modtools-head">
        <h1>
          <Link to={`/${communityName}`}>{communityName} </Link>{t("mod.data.modtools")}
        </h1>
      </div>
      <div className="modtools-dashboard">
        <div className="sidebar">
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/settings')}
            to={`/${communityName}/modtools/settings`}
          >
            {t("mod.data.community_settings")}
          </Link>
          <div className="sidebar-topic">{t("mod.tools.content")}</div>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/reports')}
            to={`/${communityName}/modtools/reports`}
          >
            {t("mod.tools.reports")}
          </Link>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/removed')}
            to={`/${communityName}/modtools/removed`}
          >
            {t("mod.tools.removed")}
          </Link>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/locked')}
            to={`/${communityName}/modtools/locked`}
          >
            {t("mod.tools.locked")}
          </Link>
          <div className="sidebar-topic">{t("mod.tools.users")}</div>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/banned')}
            to={`/${communityName}/modtools/banned`}
          >
            {t("mod.tools.banned")}
          </Link>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/mods')}
            to={`/${communityName}/modtools/mods`}
          >
            {t("mod.tools.moderators")}
          </Link>
          <div className="sidebar-topic">{t("mod.tools.rules")}</div>
          <Link
            className={isActiveCls('sidebar-item', pathname === '/modtools/rules')}
            to={`/${communityName}/modtools/rules`}
          >
            {t("mod.tools.rules")}
          </Link>
        </div>
        <Switch>
          <Route exact path={path}>
            <Redirect to={`/${communityName}/modtools/settings`} />
          </Route>
          <Route exact path={`${path}/settings`}>
            <Settings community={community} />
          </Route>
          <Route path={`${path}/reports`}>
            <Reports community={community} />
          </Route>
          <Route path={`${path}/removed`}>
            <Removed community={community} filter="deleted" title="Removed" />
          </Route>
          <Route path={`${path}/locked`}>
            <Removed community={community} filter="locked" title="Locked" />
          </Route>
          <Route path={`${path}/banned`}>
            <Banned community={community} />
          </Route>
          <Route path={`${path}/mods`}>
            <Mods community={community} />
          </Route>
          <Route path={`${path}/rules`}>
            <Rules community={community} />
          </Route>
          <Route path="*">
            <div className="modtools-content flex flex-center">{t("not_found")}</div>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default Modtools;
