import { MetaFunction } from 'react-router';
import { Page, FormInput } from '~/components'
import { SelectOption } from '~/components/FormInput'
import { useSettings, useUser } from '~/contexts'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Settings' },
    { name: 'description', content: 'Settings controls' },
  ]
}

const unitOptions: SelectOption[] = [
  { key: 'metric', label: 'Metric (km/m)', value: 'metric' },
  { key: 'imperial', label: 'Imperial (mi/ft)', value: 'imperial' },
]

export default function Settings() {
  const { settings, updateSetting } = useSettings()
  const { preferredUnits } = settings

  const { user } = useUser()

  // TODO: handle notification setting updates

  const newSurfSpots = false
  const surfSpotsNearby = false
  const swellSeasons = false
  const surfEvents = false
  const promotions = false

  return (
    <Page showHeader>
      <div className="column center-vertical mv">
        <div className="page-content">
          <h1 className="mt">Settings</h1>
          <section>
            <FormInput
              field={{
                label: 'Preferred Units',
                name: 'preferredUnits',
                type: 'select',
                options: unitOptions,
              }}
              value={preferredUnits}
              onChange={(e) => updateSetting('preferredUnits', e.target.value)}
              showLabel={!!preferredUnits}
            />
          </section>
          {user && (
            <>
              <div className="mt pt border-top">
                <h4>Email Notifications</h4>
              </div>
              <div className="mb">
                <p className="bold">General</p>
                <section>
                  <label className="row space-between">
                    <span className="flex-1">
                      <p>New Surf Spots</p>
                      <p className="font-small">
                        Be notified when new spots are discovered and added to
                        the platform
                      </p>
                    </span>
                    <input
                      type="checkbox"
                      name="newSurfSpots"
                      checked={newSurfSpots}
                      onChange={(e) => console.log(e.target.checked)}
                    />
                  </label>
                  <label className="row space-between mt">
                    <span className="flex-1">
                      <p>Surf Spots Nearby</p>
                      <p className="font-small">
                        Get alerts about surf spots near your location when you
                        travel.
                      </p>
                    </span>
                    <input
                      type="checkbox"
                      name="surfSpotsNearby"
                      checked={surfSpotsNearby}
                      onChange={(e) => console.log(e.target.checked)}
                    />
                  </label>
                </section>
                <section>
                  <p className="bold mt">Watched Surf Spots</p>
                  <label className="row space-between">
                    <span className="flex-1">
                      <p>Swell Season Alerts</p>
                      <p className="font-small">
                        Get notified when the swell season begins and ends for
                        the surf spots you're following.
                      </p>
                    </span>
                    <input
                      type="checkbox"
                      name="swellSeasons"
                      checked={swellSeasons}
                      onChange={(e) => console.log(e.target.checked)}
                    />
                  </label>
                  <label className="row space-between mt">
                    <span className="flex-1">
                      <p>Event & Contests</p>
                      <p className="font-small">
                        Stay up to date on contests and events at your watched
                        spots.
                      </p>
                    </span>
                    <input
                      type="checkbox"
                      name="surfEvents"
                      checked={surfEvents}
                      onChange={(e) => console.log(e.target.checked)}
                    />
                  </label>
                  <label className="row space-between mt">
                    <span className="flex-1">
                      <p>Deals & Promotions</p>
                      <p className="font-small">
                        Receive deals and promotions related to the surf spots
                        you follow. (i.e. flights, surf camps etc.).
                      </p>
                    </span>
                    <input
                      type="checkbox"
                      name="promotions"
                      checked={promotions}
                      onChange={(e) => console.log(e.target.checked)}
                    />
                  </label>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  )
}
