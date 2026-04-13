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
.root-error-page-header {
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
  .root-error-page-header { padding-left: 8px; }
}
.root-error-page-logo {
  cursor: pointer;
  padding-bottom: 4px;
}
.root-error-page-logo img {
  height: 56px;
  display: block;
}
.root-error-page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  min-height: 0;
}
.root-error-page-icon {
  color: #3fc1c9;
  margin-bottom: 16px;
}
.root-error-page-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem;
  color: #333;
}
.root-error-page-message {
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
  color: #666;
}
.root-error-page-actions {
  margin-top: 16px;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: center;
}
.root-error-page-btn {
  display: inline-flex;
  width: auto !important;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 8px 24px;
  min-height: 56px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 600;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    color 0.2s ease;
}
.root-error-page-btn:focus-visible {
  outline: 2px solid #046380;
  outline-offset: 2px;
}
.root-error-page-btn:focus:not(:focus-visible) {
  outline: none;
}
.root-error-page-btn-primary {
  background-color: #035061;
  border-color: #023d4d;
}
.root-error-page-btn-primary:hover {
  background-color: #046380;
  border-color: #035061;
  transform: translateY(-1px);
}
.root-error-page-btn-primary:active {
  background-color: #022a36;
  border-color: #022a36;
  transform: translateY(0);
}
.root-error-page-btn-secondary {
  background-color: #fff;
  color: #0d1619;
  border-color: #b9c2ca;
}
.root-error-page-btn-secondary:hover {
  background-color: #f8fafc;
  border-color: #727272;
  transform: translateY(-1px);
}
.root-error-page-btn-secondary:active {
  background-color: #eef2f7;
  transform: translateY(0);
}
.root-error-page-footer {
  flex-shrink: 0;
  text-align: center;
  font-size: 0.75rem;
  padding: 32px 16px 8px;
  color: #666;
}
.root-error-page-footer p {
  margin: 0;
}
`

/** Root route error boundary. Rendered when the app shell fails (e.g. failed to fetch). We don't render error details to keep the UI simple. */
export function ErrorBoundary(_props: { error: unknown }) {
  const navigate = useNavigate()

  return (
    <div className="root-error-page">
      <style dangerouslySetInnerHTML={{ __html: rootErrorPageStyles }} />
      <header className="root-error-page-header">
        <div
          className="root-error-page-logo"
          onClick={() => navigate('/')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          role="button"
          tabIndex={0}
          aria-label="Surf Spots – Return to home"
        >
          <img src="/images/png/logo-with-text.png" alt="Surf Spots logo - Return to home" />
        </div>
      </header>
      <main className="root-error-page-main">
        <div className="root-error-page-icon" aria-hidden>
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
        <h1 className="root-error-page-title">Something went wrong</h1>
        <p className="root-error-page-message">Please try again.</p>
        <div className="root-error-page-actions">
          <button
            type="button"
            className="root-error-page-btn root-error-page-btn-primary"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <button
            type="button"
            className="root-error-page-btn root-error-page-btn-secondary"
            onClick={() => navigate('/')}
          >
            Go to home
          </button>
        </div>
      </main>
      <footer className="root-error-page-footer">
        <p>{COPYRIGHT_TEXT}</p>
      </footer>
    </div>
  )
}

