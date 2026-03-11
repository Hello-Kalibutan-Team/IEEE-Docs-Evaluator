import { signOut } from '../../services/authService';

function StudentSidebar({ studentData }) {
  return (
    <aside className="student-sidebar">
      <div className="student-sidebar__brand">IEEE Docs Evaluator</div>
      <p className="student-sidebar__caption">Student Workspace</p>

      <div className="student-card student-card--profile">
        <p className="student-card__label">Logged in as</p>
        <h4 className="student-card__name">{studentData.studentName}</h4>

        <div className="student-card__meta-row">
          <span className="student-card__meta-key">Team</span>
          <span className="student-card__meta-value">{studentData.groupCode}</span>
        </div>

        <div className="student-card__meta-row">
          <span className="student-card__meta-key">Section</span>
          <span className="student-card__meta-value">{studentData.section}</span>
        </div>
      </div>

      <button className="btn btn--ghost" onClick={signOut}>
        Sign Out
      </button>
    </aside>
  );
}

export default StudentSidebar;
