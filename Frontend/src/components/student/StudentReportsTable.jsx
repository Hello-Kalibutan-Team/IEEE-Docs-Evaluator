import { formatDate } from '../../utils/dashboardUtils';

function StudentReportsTable({ reports, loading, onOpen }) {
  if (loading) return <p className="muted">Loading your evaluations...</p>;

  if (!reports.length) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">DOC</div>
        <p>No evaluations have been sent to your team yet.</p>
      </div>
    );
  }

  return (
    <table className="app-table">
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Date Evaluated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="strong">{report.fileName}</td>
            <td>{formatDate(report.evaluatedAt)}</td>
            <td>
              <button className="btn btn--soft" onClick={() => onOpen(report)}>
                View Feedback
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentReportsTable;
