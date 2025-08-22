import { FetcherWithComponents } from 'react-router'

import { SurfSpotActions } from './SurfSpotActions'

export type FetcherSubmitParams =
  | FormData
  | URLSearchParams
  | Record<string, string>

export const submitFetcher = (
  params: FetcherSubmitParams,
  fetcher: FetcherWithComponents<string>,
) => fetcher.submit(params, { method: 'POST' })

export default SurfSpotActions
