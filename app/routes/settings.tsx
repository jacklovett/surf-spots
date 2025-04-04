import { MetaFunction } from 'react-router'
import { Page, FormInput, CheckboxOption } from '~/components'
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
              <div className="mt pt">
                <h4>Email Notifications</h4>
              </div>
              <div className="mb">
                <p className="bold">General</p>
                <section>
                  <CheckboxOption
                    title="New Surf Spots"
                    description="Be notified when new spots are discovered and added to
                        the platform"
                    checked={newSurfSpots}
                    onChange={() => console.log('changed')}
                  />
                  <CheckboxOption
                    title="Surf Spots Nearby"
                    description="Get alerts about surf spots near your location when you
                        travel."
                    checked={surfSpotsNearby}
                    onChange={() => console.log('changed')}
                  />
                </section>
                <section>
                  <p className="bold mt">Watched Surf Spots</p>
                  <CheckboxOption
                    title="Swell Season Alerts"
                    description="Get notified when the swell season begins and ends for
                        the surf spots you're following."
                    checked={swellSeasons}
                    onChange={() => console.log('changed')}
                  />
                  <CheckboxOption
                    title="Event & Contests"
                    description="Stay up to date on contests and events at your watched
                        spots."
                    checked={surfEvents}
                    onChange={() => console.log('changed')}
                  />
                  <CheckboxOption
                    title="Deals & Promotions"
                    description="Receive deals and promotions related to the surf spots
                        you follow. (i.e. flights, surf camps etc.)."
                    checked={promotions}
                    onChange={() => console.log('changed')}
                  />
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  )
}
