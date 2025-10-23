import { useState, useMemo } from 'react'
import { ActionFunction, data, MetaFunction, useNavigation } from 'react-router'

import {
  Page,
  FormInput,
  CheckboxOption,
  ContentStatus,
  Loading,
  FormComponent,
} from '~/components'
import { SelectOption } from '~/components/FormInput'
import { useSettingsContext, useUserContext } from '~/contexts'
import { edit } from '~/services/networkService'
import {
  requireSessionCookie,
  getSession,
  commitSession,
} from '~/services/session.server'
import { useSubmitStatus } from '~/hooks'

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

export const action: ActionFunction = async ({ request }) => {
  // TODO: is this needed? what about settings that don't require users to register?
  const user = await requireSessionCookie(request)
  const userId = user.id
  const formData = await request.formData()

  // Handle boolean fields
  const newSurfSpots = formData.get('newSurfSpots') === 'on'
  const nearbySurfSpots = formData.get('nearbySurfSpots') === 'on'
  const swellSeasons = formData.get('swellSeasons') === 'on'
  const events = formData.get('events') === 'on'
  const promotions = formData.get('promotions') === 'on'
  const preferredUnits = formData.get('preferredUnits') as string

  const settings = {
    userId: userId,
    newSurfSpotsEmails: newSurfSpots,
    nearbySurfSpotEmails: nearbySurfSpots,
    swellSeasonEmails: swellSeasons,
    eventEmails: events,
    promotionEmails: promotions,
    preferredUnits,
  }

  try {
    const cookie = request.headers.get('Cookie') ?? ''
    await edit(`user/settings`, settings, {
      headers: {
        Cookie: cookie,
      },
    })

    // Update the session with the new settings
    const session = await getSession(cookie)
    const updatedUser = {
      ...user,
      settings: {
        newSurfSpotEmails: newSurfSpots,
        nearbySurfSpotsEmails: nearbySurfSpots,
        swellSeasonEmails: swellSeasons,
        eventEmails: events,
        promotionEmails: promotions,
        preferredUnits,
      },
    }
    session.set('user', updatedUser)

    return data(
      { submitStatus: 'Settings updated successfully', hasError: false },
      {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    )
  } catch (error) {
    console.error('Unable to update settings: ', error)
    return data(
      {
        submitStatus: 'Unable to update settings. Please try again later.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function Settings() {
  const { state } = useNavigation()
  const loading = state === 'loading'
  const submitStatus = useSubmitStatus()

  const { settings, updateSetting } = useSettingsContext()
  const { preferredUnits } = settings

  const { user } = useUserContext()

  const [newSurfSpots, setNewSurfSpots] = useState<boolean>(
    user?.settings?.newSurfSpotEmails ?? true,
  )
  const [nearbySurfSpots, setNearbySurfSpots] = useState<boolean>(
    user?.settings?.nearbySurfSpotsEmails ?? true,
  )
  const [swellSeasons, setSwellSeasons] = useState<boolean>(
    user?.settings?.swellSeasonEmails ?? true,
  )
  const [events, setEvents] = useState<boolean>(
    user?.settings?.eventEmails ?? true,
  )
  const [promotions, setPromotions] = useState<boolean>(
    user?.settings?.promotionEmails ?? true,
  )

  // Track if any settings have changed
  const hasChanges = useMemo(() => {
    if (!user?.settings) return false

    return (
      newSurfSpots !== user.settings.newSurfSpotEmails ||
      nearbySurfSpots !== user.settings.nearbySurfSpotsEmails ||
      swellSeasons !== user.settings.swellSeasonEmails ||
      events !== user.settings.eventEmails ||
      promotions !== user.settings.promotionEmails
    )
  }, [
    preferredUnits,
    user?.settings,
    newSurfSpots,
    nearbySurfSpots,
    swellSeasons,
    events,
    promotions,
  ])

  if (loading) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <h1>Settings</h1>
        <FormComponent
          loading={loading}
          submitLabel="Save Changes"
          submitStatus={submitStatus}
          method="put"
          isDisabled={!hasChanges || loading}
        >
          <div className="column h-full">
            <section>
              <FormInput
                field={{
                  label: 'Preferred Units',
                  name: 'preferredUnits',
                  type: 'select',
                  options: unitOptions,
                }}
                value={preferredUnits}
                onChange={(e) =>
                  updateSetting('preferredUnits', e.target.value)
                }
                showLabel={!!preferredUnits}
                disabled={loading}
              />
            </section>
            {user ? (
              <>
                <div className="mt pt">
                  <h4>Email Notifications</h4>
                </div>
                <div>
                  <p className="bold">General</p>
                  <section>
                    <CheckboxOption
                      name="newSurfSpots"
                      title="New Surf Spots"
                      description="Be notified when new spots are discovered and added to
                              the platform"
                      checked={newSurfSpots}
                      onChange={() => setNewSurfSpots(!newSurfSpots)}
                    />
                    <CheckboxOption
                      name="nearbySurfSpots"
                      title="Nearby Surf Spots"
                      description="Get alerts about surf spots near your location when you
                              travel."
                      checked={nearbySurfSpots}
                      onChange={() => setNearbySurfSpots(!nearbySurfSpots)}
                    />
                  </section>
                  <section>
                    <p className="bold mt">Watched Surf Spots</p>
                    <CheckboxOption
                      name="swellSeasons"
                      title="Swell Season Alerts"
                      description="Get notified when the swell season begins and ends for
                              the surf spots you're following."
                      checked={swellSeasons}
                      onChange={() => setSwellSeasons(!swellSeasons)}
                    />
                    <CheckboxOption
                      name="events"
                      title="Event & Contests"
                      description="Stay up to date on contests and events at your watched
                              spots."
                      checked={events}
                      onChange={() => setEvents(!events)}
                    />
                    <CheckboxOption
                      name="promotions"
                      title="Deals & Promotions"
                      description="Receive deals and promotions related to the surf spots
                              you follow. (i.e. flights, surf camps etc.)."
                      checked={promotions}
                      onChange={() => setPromotions(!promotions)}
                    />
                  </section>
                </div>
              </>
            ) : (
              <div className="mt pt">
                <p>Sign in to manage more settings</p>
              </div>
            )}
          </div>
        </FormComponent>
      </div>
    </Page>
  )
}
