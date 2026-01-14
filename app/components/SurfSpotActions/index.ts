import { FetcherWithComponents } from 'react-router'
import { FetcherSubmitParams } from '~/types/api'

import { SurfSpotActions } from './SurfSpotActions'

export const submitFetcher = <T = any>(
  params: FetcherSubmitParams,
  fetcher: FetcherWithComponents<T>,
  action?: string,
) => fetcher.submit(params, { method: 'POST', preventScrollReset: true, action })

export default SurfSpotActions
