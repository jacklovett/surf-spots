import { useEffect, useLayoutEffect } from 'react'
import {
  useLocation,
  useNavigation,
  useNavigationType,
} from 'react-router'

import { scrollPageToTop } from '~/utils/scrollPageToTop'

const isNavigatingAwayFrom = (
  pathname: string,
  search: string,
  pendingPathname: string,
  pendingSearch: string,
) =>
  pendingPathname !== pathname || pendingSearch !== search

/**
 * Scroll to top when the user leaves a route (links, forms, navigate()).
 * Click/tap starts the animation from the current scroll position; after
 * navigation settles we snap to top so ScrollRestoration cannot restore a
 * lower position (Layout runs this hook after ScrollRestoration).
 */
export const useScrollToTopOnNavigation = () => {
  const location = useLocation()
  const navigation = useNavigation()
  const navigationType = useNavigationType()
  const pendingLocation = navigation.location

  const isNavigatingAway =
    (navigation.state === 'submitting' || navigation.state === 'loading') &&
    pendingLocation != null &&
    isNavigatingAwayFrom(
      location.pathname,
      location.search,
      pendingLocation.pathname,
      pendingLocation.search,
    )

  // Client-side links (data-discover): scroll on click, not pointerdown, so the page
  // does not move before the click completes (which would cancel navigation).
  useEffect(() => {
    const onLinkClick = (event: MouseEvent) => {
      if (event.button !== 0) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }
      const anchor = target.closest('a[data-discover][href]')
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }
      if (anchor.hasAttribute('data-suppress-scroll-on-navigate')) {
        return
      }
      if (anchor.target && anchor.target !== '_self') {
        return
      }
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) {
        return
      }
      try {
        const url = new URL(href, window.location.origin)
        if (url.origin !== window.location.origin) {
          return
        }
        if (
          url.pathname === location.pathname &&
          url.search === location.search
        ) {
          return
        }
      } catch {
        return
      }
      scrollPageToTop({ smooth: true })
    }

    document.addEventListener('click', onLinkClick, true)
    return () => document.removeEventListener('click', onLinkClick, true)
  }, [location.pathname, location.search])

  // Forms and navigate(): scroll when the router reports a pending route change.
  useLayoutEffect(() => {
    if (!isNavigatingAway) {
      return
    }
    scrollPageToTop({ smooth: true })
  }, [isNavigatingAway])

  // Forward navigations: stay at top after ScrollRestoration runs (child effect order).
  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      return
    }
    scrollPageToTop({ smooth: false })
  }, [location.key, navigationType])
}
