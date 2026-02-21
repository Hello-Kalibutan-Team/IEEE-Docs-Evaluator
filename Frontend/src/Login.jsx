import { supabase } from './supabaseClient';

function Login({ authError }) {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>IEEE Docs Evaluator</h1>
      <p>Please sign in with your student Google account to continue.</p>
      
      {/* Display errors from Spring Boot here */}
      {authError && (
        <div style={{ color: 'red', margin: '20px', padding: '10px', border: '1px solid red', display: 'inline-block', borderRadius: '5px' }}>
          <strong>Access Denied:</strong> {authError}
        </div>
      )}
      
      <br />
      <button 
        onClick={handleGoogleLogin} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;