export const initiateGoogleLogin = async () => {
  try {
    const apiBase = (import.meta as any).env.VITE_API_URL || '';
    const apiUrl = `${apiBase}/api/auth/google/url`;
    console.log(`[Auth] Fetching Google Auth URL from: ${apiUrl}`);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Failed to get auth URL: ${response.status} ${response.statusText}`);
    const { url } = await response.json();
    
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      url,
      'google_login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  } catch (err) {
    console.error("Google login error:", err);
    throw err;
  }
};
