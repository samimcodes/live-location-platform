import {
  LayoutDashboard,
  Map,
  Users,
  UserPlus,
  Users2,
  Bell,
  History,
  Bookmark,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeType?: 'live' | 'requests' | 'notifications';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Core Platform',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Live Map', href: '/dashboard/map', icon: Map, badgeType: 'live' },
      { name: 'Location History', href: '/dashboard/history', icon: History },
    ],
  },
  {
    title: 'Circles & Social',
    items: [
      { name: 'Friends', href: '/dashboard/friends', icon: Users },
      { name: 'Requests', href: '/dashboard/friends/requests', icon: UserPlus, badgeType: 'requests' },
      { name: 'Groups & Circles', href: '/dashboard/groups', icon: Users2 },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { name: 'Saved Places', href: '/dashboard/saved-places', icon: Bookmark },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badgeType: 'notifications' },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

// Flat export for backward compatibility
export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
