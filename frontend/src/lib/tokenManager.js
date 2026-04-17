class TokenManager {
    constructor() {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      this.refreshPromise = null;
    }
  
    setTokens({ accessToken, refreshToken, expiresIn }) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = Date.now() + expiresIn * 1000 - 30_000;
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
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
  
      if (!response.ok) {
        this.clear();
        throw new Error("Session expired");
      }
  
      const data = await response.json();
      this.setTokens(data);
      return this.accessToken;
    }
  
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
    }
  }
  
  export const tokenManager = new TokenManager();