import { Breadcrumb } from './Breadcrumb'

export interface BreadcrumbItem {
  label: string
  link: string
}

export const formatSlug = (slug: string) => slug.replace('-', ' ')

export default Breadcrumb
