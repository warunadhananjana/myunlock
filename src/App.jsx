import { useState, useEffect } from 'react';

function UnlockPage({ slug }) {
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clickedLinks, setClickedLinks] = useState([]);

  useEffect(() => {
    const loadLink = async () => {
      try {
        const response = await fetch(
          `https://myunlock-backend-production.up.railway.app/api/links/${slug}`
        );

        const data = await response.json();

        if (response.ok) {
          setLinkData(data);
        } else {
          setError(data.message || 'Link not found');
        }
      } catch (error) {
        console.error(error);
        setError('Cannot connect to server');
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, [slug]);

  const handleWatchClick = (index, link) => {
    window.open(link, '_blank');

    const handleReturn = () => {
      setClickedLinks((previous) => {
        if (previous.includes(index)) {
          return previous;
        }

        return [...previous, index];
      });

      window.removeEventListener('focus', handleReturn);
    };

    window.addEventListener('focus', handleReturn);
  };

  if (loading) {
    return (
      <div className="unlock-page">
        <div className="unlock-card loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading...</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unlock-page">
        <div className="unlock-card error-card">
          <div className="error-icon">⚠️</div>
          <h2>Link Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="unlock-page">
        <div className="unlock-card error-card">
          <div className="error-icon">🔗</div>
          <h2>Link Not Found</h2>
          <p>This unlock link does not exist.</p>
        </div>
      </div>
    );
  }

  const totalLinks = linkData.watchLinks.length;

  const allCompleted = clickedLinks.length === totalLinks && totalLinks > 0;

  const progress = (clickedLinks.length / totalLinks) * 100;

  return (
    <div className="unlock-page">
      <div className="unlock-card">
        {/* Logo */}
        <div className="unlock-logo">
          <div className="logo-icon">🔓</div>

          <span>MyUnlock</span>
        </div>

        {/* Header */}
        <div className="unlock-header">
          <div className="lock-icon">🔒</div>

          <h1>Link Locked</h1>

          <p>Complete the tasks below to unlock your video.</p>
        </div>

        {/* Progress */}
        <div className="progress-area">
          <div className="progress-text">
            <span>Progress</span>

            <strong>
              {clickedLinks.length}/{totalLinks}
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Watch Links */}
        <div className="tasks">
          {linkData.watchLinks.map((link, index) => {
            const completed = clickedLinks.includes(index);

            return (
              <button
                key={index}
                type="button"
                className={`click-button ${completed ? 'click-completed' : ''}`}
                disabled={completed}
                onClick={() => handleWatchClick(index, link)}
              >
                <span>{completed ? '✓' : '▶'}</span>

                <span>
                  {completed
                    ? `Click ${index + 1} Completed`
                    : `Click ${index + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Completed message */}
        {!allCompleted && (
          <div className="info-message">
            <span>💡</span>

            <p>Complete all {totalLinks} tasks to unlock your video.</p>
          </div>
        )}

        {/* Get Video */}
        {allCompleted && (
          <div className="get-video-section">
            <div className="success-message">
              <span>🎉</span>

              <div>
                <strong>All tasks completed!</strong>

                <small>Your video is ready.</small>
              </div>
            </div>

            <button
              type="button"
              className="get-video-button"
              onClick={() => {
                window.location.href = linkData.destinationUrl;
              }}
            >
              <span>🎬</span>

              <span>Get Video</span>

              <span>→</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="unlock-footer">🔐 Secure unlock system</div>
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;

  const isUnlockPage = path.startsWith('/u/');

  // =========================
  // UNLOCK PAGE
  // =========================

  if (isUnlockPage) {
    const slug = path.split('/u/')[1];

    return <UnlockPage slug={slug} />;
  }

  // =========================
  // LOGIN / REGISTER
  // =========================

  const [isLogin, setIsLogin] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // =========================
  // CREATE LINK
  // =========================

  const [destinationUrl, setDestinationUrl] = useState('');

  const [watchLinks, setWatchLinks] = useState(['', '']);

  const [generatedLink, setGeneratedLink] = useState('');

  // =========================
  // LOGIN / REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? 'https://myunlock-backend-production.up.railway.app/api/auth/login'
      : 'https://myunlock-backend-production.up.railway.app/api/auth/register';

    try {
      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await fetch(url, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);

          alert('Login successful!');

          setIsLoggedIn(true);
        } else {
          alert('Registration successful!');

          setName('');
          setEmail('');
          setPassword('');

          setIsLogin(true);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);

      alert('Cannot connect to server');
    }
  };

  // =========================
  // WATCH LINK FUNCTIONS
  // =========================

  const addWatchLink = () => {
    if (watchLinks.length < 4) {
      setWatchLinks([...watchLinks, '']);
    }
  };

  const removeWatchLink = (index) => {
    if (watchLinks.length > 2) {
      const newLinks = watchLinks.filter((_, i) => i !== index);

      setWatchLinks(newLinks);
    }
  };

  const updateWatchLink = (index, value) => {
    const newLinks = [...watchLinks];

    newLinks[index] = value;

    setWatchLinks(newLinks);
  };

  // =========================
  // GENERATE LINK
  // =========================

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!destinationUrl) {
      alert('Please enter Destination URL');

      return;
    }

    const emptyLink = watchLinks.some((link) => !link);

    if (emptyLink) {
      alert('Please enter all Watch Now links');

      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first');

      setIsLoggedIn(false);

      return;
    }

    try {
      const response = await fetch(
        'https://myunlock-backend-production.up.railway.app/api/links/create',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            destinationUrl,
            watchLinks,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setGeneratedLink(data.link);

        alert('Unlock link created successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);

      alert('Cannot connect to server');
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('token');

    setIsLoggedIn(false);

    setEmail('');
    setPassword('');

    setGeneratedLink('');
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="create-container">
        <div className="create-box">
          <h1>MyUnlock</h1>

          <h2>{isLogin ? 'Login' : 'Create Account'}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label>Name</label>

                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </>
            )}

            <label>Email</label>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="generate-button">
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();

                setIsLogin(!isLogin);
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // CREATE LINK PAGE
  // =========================

  return (
    <div className="create-container">
      <div className="create-box">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1>MyUnlock</h1>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <h2>Create Unlock Link</h2>

        <form onSubmit={handleGenerate}>
          <label>Destination URL</label>

          <input
            type="url"
            placeholder="Enter Telegram video/post URL"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
          />

          <h3>Watch Now Links</h3>

          {watchLinks.map((link, index) => (
            <div className="watch-link" key={index}>
              <label>Watch Now Link {index + 1}</label>

              <input
                type="url"
                placeholder="Enter advertising URL"
                value={link}
                onChange={(e) => updateWatchLink(index, e.target.value)}
                required
              />

              {watchLinks.length > 2 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeWatchLink(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {watchLinks.length < 4 && (
            <button type="button" className="add-button" onClick={addWatchLink}>
              + Add Watch Now Link
            </button>
          )}

          <button type="submit" className="generate-button">
            Generate Link
          </button>
        </form>

        {generatedLink && (
          <div className="generated-link">
            <h3>Your Unlock Link</h3>

            <input type="text" value={generatedLink} readOnly />

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(generatedLink)}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
