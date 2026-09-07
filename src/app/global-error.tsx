'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            A critical error occurred. Please try reloading the application.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                height: '44px',
                padding: '0 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                height: '44px',
                padding: '0 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
