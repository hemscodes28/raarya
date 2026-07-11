import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize only if keys are present
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: any }> {
  if (!supabase) {
    console.log("Supabase keys not found. Simulating Google Popup Sign-In...");
    return new Promise((resolve) => {
      const width = 500;
      const height = 550;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        "about:blank",
        "Google Sign-In",
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (popup) {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Sign in with Google</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: #ffffff;
                  color: #3c4043;
                  text-align: center;
                }
                .container {
                  border: 1px solid #dadce0;
                  padding: 40px;
                  border-radius: 8px;
                  max-width: 360px;
                  width: 100%;
                  box-sizing: border-box;
                }
                .logo { width: 32px; height: 32px; margin-bottom: 16px; }
                .title { font-size: 22px; font-weight: 400; margin-bottom: 8px; color: #202124; }
                .subtitle { font-size: 14px; color: #5f6368; margin-bottom: 24px; }
                .account-box {
                  border-top: 1px solid #dadce0;
                  border-bottom: 1px solid #dadce0;
                  margin-bottom: 20px;
                }
                .account {
                  background: white;
                  padding: 12px 0;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  cursor: pointer;
                  text-align: left;
                  width: 100%;
                  border: none;
                  outline: none;
                  transition: background 0.15s;
                }
                .account:hover { background: #f8f9fa; }
                .avatar { 
                  width: 32px; 
                  height: 32px; 
                  border-radius: 50%; 
                  background: #1a73e8; 
                  color: white; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  font-weight: 500;
                  font-size: 15px;
                }
                .info { display: flex; flex-direction: column; }
                .name { font-size: 14px; font-weight: 500; color: #3c4043; }
                .email { font-size: 12px; color: #5f6368; }
                .footer { font-size: 12px; color: #5f6368; line-height: 1.4; margin-top: 20px; }
                .footer a { color: #1a73e8; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <svg class="logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <div class="title">Choose an account</div>
                <div class="subtitle">to continue to <b>Raarya Groups</b></div>
                
                <div class="account-box">
                  <button class="account" onclick="selectAccount()">
                    <div class="avatar">H</div>
                    <div class="info">
                      <span class="name">Hemkumar Ramesh</span>
                      <span class="email">2403717624321018@cit.edu.in</span>
                    </div>
                  </button>
                </div>
                
                <div class="footer">
                  To continue, Google will share your name, email address, language preference, and profile picture with Raarya Groups.
                </div>
              </div>

              <script>
                function selectAccount() {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_SUCCESS',
                    name: 'Hemkumar Ramesh',
                    email: '2403717624321018@cit.edu.in',
                    avatar: ''
                  }, '*');
                }
              </script>
            </body>
          </html>
        `);
        
        const listener = (event: MessageEvent) => {
          if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            popup.close();
            window.removeEventListener('message', listener);
            const mockUser = {
              name: event.data.name,
              email: event.data.email,
              phone: '9876543210',
              whatsapp: '9876543210',
              avatar: event.data.avatar
            };
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            resolve({ success: true, user: mockUser });
          }
        };
        
        window.addEventListener('message', listener);
      }
    });
  }

  // Real Supabase OAuth flow
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  return { success: !error, error };
}
