import { Page } from '~/components'

export default function Settings() {
  const loading = false
  const error = null

  return (
    <Page showHeader loading={loading} error={error}>
      <div className="column center">
        <p>Settings</p>
      </div>
    </Page>
  )
}
