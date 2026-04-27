import DropdownMenu from './DropdownMenu'

export interface DropdownMenuItem {
  label: string
  iconKey?: string
  loading?: boolean
  onClick: () => void
  disabled?: boolean
  closeOnClick?: boolean
}

export default DropdownMenu
