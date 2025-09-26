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
  { key: 'about-us', icon: 'about', label: 'About Us', path: '/about-us' },
  { key: 'contact', icon: 'envelope', label: 'Contact', path: '/contact' },
  { key: 'logout', icon: 'logout', label: 'Logout', path: '/auth/logout' },
]

export default Menu
