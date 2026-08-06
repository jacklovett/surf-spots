/**
 * Sub-region spots use `SurfSpot.path` like
 * `/surf-spots/.../region/sub-regions/{subRegion}/{slug}`. Same loader/action as the
 * non-sub-region spot detail route; only the URL shape differs.
 */
export { loader, action, default } from './surf-spots.$continent_.$country_.$region_.$surfSpot'
