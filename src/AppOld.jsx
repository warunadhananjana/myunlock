import { useState } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

          console.log('User:', data.user);

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
  // LOGIN / REGISTER PAGE
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
  // CREATE UNLOCK LINK PAGE
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
          {/* Destination URL */}

          <label>Destination URL</label>

          <input
            type="url"
            placeholder="Enter Telegram video/post URL"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
          />

          {/* Watch Now Links */}

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

          {/* Add Link */}

          {watchLinks.length < 4 && (
            <button type="button" className="add-button" onClick={addWatchLink}>
              + Add Watch Now Link
            </button>
          )}

          {/* Generate */}

          <button type="submit" className="generate-button">
            Generate Link
          </button>
        </form>

        {/* Generated Link */}

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
