import { signOut } from '../../services/authService';

function StudentSidebar({ studentData }) {
  return (
    <aside className="student-sidebar">
      <div className="student-sidebar__brand">IEEE Docs Evaluator</div>
      <p className="student-sidebar__caption">Student Workspace</p>

      <div className="student-card student-card--profile">
        <p className="student-card__label">Logged in as</p>
        <h4>{studentData.studentName}</h4>
        <p>Team: {studentData.groupCode}</p>
        <p>Section: {studentData.section}</p>
      </div>

      <button className="btn btn--ghost" onClick={signOut}>
        Sign Out
      </button>
    </aside>
  );
}

export default StudentSidebar;
