import clsx from 'clsx';
import { MouseEvent } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Sidebar({
  className,
  onMenuItemClick,
}: {
  className?: string;
  onMenuItemClick?: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [t] = useTranslation("global");
  const { url } = useRouteMatch();
  const dashboardLink = (path: string) => {
    return `${url}/${path}`;
  };

  const handleListClick = (event: MouseEvent<HTMLElement>) => {
    if (onMenuItemClick) {
      let target = event.target as HTMLElement | null;
      while (target) {
        if (target.classList.contains('sidebar-item')) {
          onMenuItemClick();
          break;
        }
        target = target.parentElement;
      }
    }
  };

  return (
    <aside className={clsx('sidebar sidebar-left is-custom-scrollbar is-v2', className)}>
      <div className="sidebar-content">
        <div className="sidebar-list" onClick={handleListClick}>
          <Link className="sidebar-item" to={url}>
            {t("sidebar.home")}
          </Link>
          <Link className="sidebar-item" to={dashboardLink('users')}>
            {t("sidebar.users")}
          </Link>
          <Link className="sidebar-item" to={dashboardLink('comments')}>
            {t("sidebar.comments")}
          </Link>
          <Link className="sidebar-item" to={dashboardLink('communities')}>
            {t("sidebar.communities")}
          </Link>
          <Link className="sidebar-item" to={dashboardLink('ipbans')}>
            {t("ip_bans")}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
