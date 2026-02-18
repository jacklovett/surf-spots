import { useNavigate } from 'react-router'
import { COPYRIGHT_TEXT } from '~/components/Footer'

/** Self-contained styles for root error page (no dependency on main bundle). Values match app variables. */
const rootErrorPageStyles = `
html:has(.root-error-page),
body:has(.root-error-page) {
  overflow: hidden;
  height: 100%;
}
.root-error-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  color: #0d1619;
  background-color: #fff;
}
.root-error-page__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  border-bottom: solid 1px #d9d9d9;
  padding-left: 16px;
  height: 56px;
}
@media (max-width: 752px) {
  .root-error-page__header { padding-left: 8px; }
}
.root-error-page__logo {
  cursor: pointer;
  padding-bottom: 4px;
}
.root-error-page__logo img {
  height: 56px;
  display: block;
}
.root-error-page__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  min-height: 0;
}
.root-error-page__icon {
  color: #3fc1c9;
  margin-bottom: 16px;
}
.root-error-page__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #333;
}
.root-error-page__message {
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
  color: #666;
}
.root-error-page__actions {
  margin-top: 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: center;
}
.root-error-page__btn {
  padding: 10px 20px;
  min-height: 56px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
}
.root-error-page__btn--primary {
  background-color: #046380;
}
.root-error-page__btn--secondary {
  background-color: #2aa8af;
}
.root-error-page__footer {
  flex-shrink: 0;
  text-align: center;
  font-size: 0.75rem;
  padding: 32px 16px 8px;
  color: #666;
}
.root-error-page__footer p {
  margin: 0;
}
`

/** Root route error boundary. Rendered when the app shell fails (e.g. failed to fetch). We don't render error details to keep the UI simple. */
export function ErrorBoundary(_props: { error: unknown }) {
  const navigate = useNavigate()

  return (
    <div className="root-error-page">
      <style dangerouslySetInnerHTML={{ __html: rootErrorPageStyles }} />
      <header className="root-error-page__header">
        <div
          className="root-error-page__logo"
          onClick={() => navigate('/')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          role="button"
          tabIndex={0}
          aria-label="Surf Spots – Return to home"
        >
          <img src="/images/png/logo-with-text.png" alt="Surf Spots logo - Return to home" />
        </div>
      </header>
      <main className="root-error-page__main">
        <div className="root-error-page__icon" aria-hidden>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M24 3L3 42h42L24 3z" strokeWidth="4" />
            <line x1="24" y1="16" x2="24" y2="26" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="32" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <h1 className="root-error-page__title">Something went wrong</h1>
        <p className="root-error-page__message">Please try again.</p>
        <div className="root-error-page__actions">
          <button
            type="button"
            className="root-error-page__btn root-error-page__btn--primary"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <button
            type="button"
            className="root-error-page__btn root-error-page__btn--secondary"
            onClick={() => navigate('/')}
          >
            Go to home
          </button>
        </div>
      </main>
      <footer className="root-error-page__footer">
        <p>{COPYRIGHT_TEXT}</p>
      </footer>
    </div>
  )
}

