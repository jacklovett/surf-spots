import { SelectionModal } from "./SelectionModal";

export interface SelectionItem {
    id: string
    name: string
    subtitle?: string // Optional subtitle (e.g., board type)
    metadata?: string // Optional metadata (e.g., dates)
    description?: string // Optional description
    [key: string]: unknown // Allow additional properties
  }

export default SelectionModal