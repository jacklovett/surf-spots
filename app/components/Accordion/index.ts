import { ReactNode } from 'react'
import { Accordion } from './Accordion'

export interface AccordionItem {
    id: string
    title: string
    content: ReactNode
  }
  
export default Accordion
