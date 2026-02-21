import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { verifyStudentWithBackend } from './api'; 
import Login from './Login';
import Home from './Home';

function App() {
  const [studentData, setStudentData] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      
      if (event === 'SIGNED_IN' && currentSession) {
        setIsVerifying(true);
        setAuthError('');
        
        try {
          const googleName = currentSession.user.user_metadata.full_name;
          const googleEmail = currentSession.user.email; 
          
          const data = await verifyStudentWithBackend(googleName, googleEmail);
          setStudentData(data); 
          
        } catch (error) {
          setAuthError(error.message);
          await supabase.auth.signOut();
          setStudentData(null);
        } finally {
          setIsVerifying(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setStudentData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isVerifying) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Verifying Identity...</h2></div>;
  }

  // Determine which screen to show based on login status and role
  return (
    <div>
      {studentData ? (
        studentData.role === 'TEACHER' ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ color: 'blue' }}>Teacher Dashboard</h1>
            <p>Welcome, Evaluator {studentData.studentName}</p>
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        ) : (
          <Home studentData={studentData} />
        )
      ) : (
        <Login authError={authError} />
      )}
    </div>
  );
}

export default App;