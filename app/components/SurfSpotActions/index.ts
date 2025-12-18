import { FetcherWithComponents } from 'react-router'
import { FetcherSubmitParams } from '~/types/api'

import { SurfSpotActions } from './SurfSpotActions'

export const submitFetcher = (
  params: FetcherSubmitParams,
  fetcher: FetcherWithComponents<string>,
) => fetcher.submit(params, { method: 'POST', preventScrollReset: true })

export default SurfSpotActions
