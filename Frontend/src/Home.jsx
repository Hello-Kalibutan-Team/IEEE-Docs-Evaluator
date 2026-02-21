import { supabase } from './supabaseClient';

function Home({ studentData }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green' }}>Authentication Successful!</h1>
      <h2>Welcome, {studentData.studentName}</h2>
      
      <div style={{ margin: '30px auto', padding: '20px', border: '1px solid #ccc', maxWidth: '400px', textAlign: 'left', borderRadius: '8px' }}>
        <h3>Your Capstone Details:</h3>
        {/* These fields match the Java StudentTrackerRecord properties exactly */}
        <p><strong>Section:</strong> {studentData.section}</p>
        <p><strong>Group Code:</strong> {studentData.groupCode}</p>
      </div>

      <button 
        onClick={handleLogout}
        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Home;