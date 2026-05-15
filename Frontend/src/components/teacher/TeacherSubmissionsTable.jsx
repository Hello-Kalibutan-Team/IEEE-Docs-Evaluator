import { getDisplayType } from '../../utils/dashboardUtils';
import { formatDateTime } from '../../utils/dashboardUtils';

function TeacherSubmissionsTable({ files, loading, isSyncing, analyzedFileIds, onSort, onAnalyze, onViewHistory }) {
  return (
    <div className="card">
      <table className="app-table" id="teacher-submission-table">
        <thead>
          <tr>
            <th>Submission Identity</th>
            <th onClick={() => onSort('mimeType')}>Submission Type</th>
            <th onClick={() => onSort('date')}>Date Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading || isSyncing ? (
            <tr>
              <td colSpan="4" className="muted">Loading submissions...</td>
            </tr>
          ) : files.length === 0 ? (
            <tr>
              <td colSpan="4" className="muted">No submissions match the selected filters.</td>
            </tr>
          ) : (
            files.map((file, index) => (
              <tr key={`${file.id}-${index}`}>
                <td>
                  <a href={file.webViewLink} target="_blank" rel="noreferrer" className="strong link-reset">
                    {file.name}
                  </a>
                </td>
                <td>{getDisplayType(file.mimeType)}</td>
                <td>{formatDateTime(file.submittedAt)}</td>
                <td>
                  <div className="teacher-submissions__actions">
                    <button className="btn btn--soft teacher-submissions__action-btn" onClick={() => onAnalyze(file)}>
                      {analyzedFileIds?.has(file.id) ? 'Re-Evaluate' : 'Run AI Analysis'}
                    </button>
                    <button className="btn btn--soft teacher-submissions__history-btn" onClick={() => onViewHistory?.(file)}>
                      View History
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherSubmissionsTable;
