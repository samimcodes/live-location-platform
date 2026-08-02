import {
  LayoutDashboard,
  Map,
  Users,
  UserPlus,
  Group,
  Bell,
  History,
  Bookmark,
  Settings,
} from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Map', href: '/dashboard/map', icon: Map },
  { name: 'Friends', href: '/dashboard/friends', icon: Users },
  { name: 'Requests', href: '/dashboard/friends/requests', icon: UserPlus },
  { name: 'Groups', href: '/dashboard/groups', icon: Group },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Saved Places', href: '/dashboard/saved-places', icon: Bookmark },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
