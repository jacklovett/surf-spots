import { IconKey } from '../Icon'
import Menu from './Menu'

export interface MenuItem {
  key: string
  icon: IconKey
  label: string
  path: string
}

export const spotsMenuItems: MenuItem[] = [
  {
    key: 'surf-spots',
    icon: 'surfboard',
    label: 'Surf Spots',
    path: '/surf-spots',
  },
  {
    key: 'surfed-spots',
    icon: 'pin',
    label: 'Surfed Spots',
    path: '/surfed-spots',
  },
  {
    key: 'watch-list',
    icon: 'heart',
    label: 'Watch List',
    path: '/watch-list',
  },
]

export const profileMenuItems: MenuItem[] = [
  { key: 'profile', icon: 'profile', label: 'Profile', path: '/profile' },
  { key: 'settings', icon: 'cog', label: 'Settings', path: '/settings' },
  { key: 'logout', icon: 'logout', label: 'Logout', path: '/' },
]

export default Menu
