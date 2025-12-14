import { IconKey } from '../Icon'
import Menu from './Menu'

export interface MenuItem {
  key: string
  icon: IconKey
  label: string
  path: string
}

// Spots category - surf spots, surfed spots, and watch list
export const spotsMenuItems: MenuItem[] = [
  {
    key: 'surf-spots',
    icon: 'pin',
    label: 'Surf Spots',
    path: '/surf-spots',
  },
  {
    key: 'surfed-spots',
    icon: 'clipboard',
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

// Collections category - trips and surfboards
export const collectionMenuItems: MenuItem[] = [
  {
    key: 'trips',
    icon: 'plane',
    label: 'Trips',
    path: '/trips',
  },
  {
    key: 'surfboards',
    icon: 'surfboard',
    label: 'Surfboards',
    path: '/surfboards',
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
