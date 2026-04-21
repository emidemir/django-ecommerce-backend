class TokenManager {
  constructor() {
    this.refreshPromise = null;
    // ✅ rehydrate from storage on startup
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.expiresAt = Number(localStorage.getItem('expiresAt')) || null;
  }

  setTokens({ accessToken, refreshToken, expiresIn }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // 👇 Change the 30_000 (30 secs) to 5_000 (5 secs) while testing!
    // You can change it back to 30_000 when you go back to normal token lifetimes (e.g., 5+ minutes).
    this.expiresAt = Date.now() + expiresIn * 1000 - 5_000; 

    // ✅ persist so they survive page refreshes
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('expiresAt', this.expiresAt);
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    // ✅ clean up storage on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
  }

  isExpired() {
    return !this.expiresAt || Date.now() >= this.expiresAt;
  }

  async getValidToken() {
    if (!this.isExpired()) return this.accessToken;
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this._refresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async _refresh() {
    console.log('Refreshing token with:', this.refreshToken);
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: this.refreshToken }), 
    });

    if (!response.ok) {
      this.clear();
      throw new Error('Session expired');
    }

    const data = await response.json();

    // 1. Decode the NEW access token to get the new expiration time
    const tokenPayload = JSON.parse(atob(data.access.split('.')[1]));
    const expiresInSeconds = tokenPayload.exp - Math.floor(Date.now() / 1000);

    // 2. Map the backend fields correctly!
    // If your backend doesn't return a new refresh token (token rotation is off),
    // we must fall back to keeping the current `this.refreshToken`.
    this.setTokens({
      accessToken: data.access,
      refreshToken: data.refresh || this.refreshToken, 
      expiresIn: expiresInSeconds,
    });

    return this.accessToken;
  }
}

export const tokenManager = new TokenManager();