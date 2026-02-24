import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ActionFunction,
  data,
  LoaderFunction,
  MetaFunction,
  useNavigation,
} from 'react-router'

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
import { units } from '~/contexts/SettingsContext'
import { ERROR_UPDATE_SETTINGS } from '~/utils/errorUtils'
import { edit } from '~/services/networkService'
import {
  requireSessionCookie,
  getSession,
  commitSession,
} from '~/services/session.server'
import { useSubmitStatus } from '~/hooks'

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Settings' },
  { name: 'description', content: 'Settings controls' },
]

const unitOptions: SelectOption[] = [
  { key: 'metric', label: 'Metric (km/m)', value: 'metric' },
  { key: 'imperial', label: 'Imperial (mi/ft)', value: 'imperial' },
]

export const loader: LoaderFunction = async () => data({})

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const preferredUnits = formData.get('preferredUnits') as string

  // Check if user is logged in
  let user = null
  try {
    user = await requireSessionCookie(request)
  } catch {
    // Non-logged-in user - save to localStorage in component
    return data(
      { submitStatus: 'Settings updated successfully', hasError: false },
      { status: 200 },
    )
  }

  // Logged-in user - save all settings to backend
  const settings = {
    userId: user.id,
    newSurfSpotsEmails: formData.get('newSurfSpots') === 'on',
    nearbySurfSpotEmails: formData.get('nearbySurfSpots') === 'on',
    swellSeasonEmails: formData.get('swellSeasons') === 'on',
    eventEmails: formData.get('events') === 'on',
    promotionEmails: formData.get('promotions') === 'on',
    preferredUnits,
  }

  try {
    const cookie = request.headers.get('Cookie') ?? ''
    await edit(`user/settings`, settings, {
      headers: { Cookie: cookie },
    })

    const session = await getSession(cookie)
    session.set('user', {
      ...user,
      settings: {
        newSurfSpotEmails: settings.newSurfSpotsEmails,
        nearbySurfSpotsEmails: settings.nearbySurfSpotEmails,
        swellSeasonEmails: settings.swellSeasonEmails,
        eventEmails: settings.eventEmails,
        promotionEmails: settings.promotionEmails,
        preferredUnits,
      },
    })

    return data(
      { submitStatus: 'Settings updated successfully', hasError: false },
      {
        status: 200,
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    )
  } catch (error) {
    console.error('Unable to update settings: ', error)
    return data(
      {
        submitStatus: ERROR_UPDATE_SETTINGS,
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
  const { user } = useUserContext()

  const [preferredUnits, setPreferredUnits] = useState<units>(
    settings.preferredUnits,
  )
  const [emailSettings, setEmailSettings] = useState({
    newSurfSpots: user?.settings?.newSurfSpotEmails ?? true,
    nearbySurfSpots: user?.settings?.nearbySurfSpotsEmails ?? true,
    swellSeasons: user?.settings?.swellSeasonEmails ?? true,
    events: user?.settings?.eventEmails ?? true,
    promotions: user?.settings?.promotionEmails ?? true,
  })

  // Track if we've already saved to avoid infinite loop
  const hasSavedRef = useRef<string | null>(null)

  // Save preferredUnits to localStorage after successful form submission
  useEffect(() => {
    if (
      submitStatus &&
      !submitStatus.isError &&
      submitStatus.message &&
      submitStatus.message !== hasSavedRef.current
    ) {
      hasSavedRef.current = submitStatus.message
      updateSetting('preferredUnits', preferredUnits)
    }
  }, [submitStatus?.message, preferredUnits, updateSetting])

  // Check if any settings have changed
  const hasChanges = useMemo(() => {
    if (preferredUnits !== settings.preferredUnits) return true
    if (!user?.settings) return false
    return (
      emailSettings.newSurfSpots !== user.settings.newSurfSpotEmails ||
      emailSettings.nearbySurfSpots !== user.settings.nearbySurfSpotsEmails ||
      emailSettings.swellSeasons !== user.settings.swellSeasonEmails ||
      emailSettings.events !== user.settings.eventEmails ||
      emailSettings.promotions !== user.settings.promotionEmails
    )
  }, [preferredUnits, settings.preferredUnits, emailSettings, user?.settings])

  const toggleEmailSetting = (key: keyof typeof emailSettings) =>
    setEmailSettings((prev) => ({ ...prev, [key]: !prev[key] }))

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
          submitLabel="Save Changes"
          submitStatus={submitStatus}
          method="put"
          isDisabled={!hasChanges}
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
                onChange={(e) => setPreferredUnits(e.target.value as units)}
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
                      description="Be notified when new spots are discovered and added to the platform"
                      checked={emailSettings.newSurfSpots}
                      onChange={() => toggleEmailSetting('newSurfSpots')}
                    />
                    <CheckboxOption
                      name="nearbySurfSpots"
                      title="Nearby Surf Spots"
                      description="Get alerts about surf spots near your location when you travel."
                      checked={emailSettings.nearbySurfSpots}
                      onChange={() => toggleEmailSetting('nearbySurfSpots')}
                    />
                  </section>
                  <section>
                    <p className="bold mt">Watched Surf Spots</p>
                    <CheckboxOption
                      name="swellSeasons"
                      title="Swell Season Alerts"
                      description="Get notified when the swell season begins and ends for the surf spots you're following."
                      checked={emailSettings.swellSeasons}
                      onChange={() => toggleEmailSetting('swellSeasons')}
                    />
                    <CheckboxOption
                      name="events"
                      title="Event & Contests"
                      description="Stay up to date on contests and events at your watched spots."
                      checked={emailSettings.events}
                      onChange={() => toggleEmailSetting('events')}
                    />
                    <CheckboxOption
                      name="promotions"
                      title="Deals & Promotions"
                      description="Receive deals and promotions related to the surf spots you follow. (i.e. flights, surf camps etc.)."
                      checked={emailSettings.promotions}
                      onChange={() => toggleEmailSetting('promotions')}
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
