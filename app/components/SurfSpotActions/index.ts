import { FetcherWithComponents } from 'react-router';

import { SurfSpotActions } from './SurfSpotActions'

export interface SurfSpotActionFetcherResponse {
  success: boolean
  error?: string
}

export type FetcherSubmitParams =
  | FormData
  | URLSearchParams
  | Record<string, string>

export const submitFetcher = (
  params: FetcherSubmitParams,
  fetcher: FetcherWithComponents<SurfSpotActionFetcherResponse>,
) => {
  fetcher.submit(params, { method: 'POST' })
}

export default SurfSpotActions
