import '../../styles/components/teacher-filter-panel.css';

function TeacherFilterPanel({
  students = [],
  sections = [],
  teamCodes = [],
  docTypes = [],
  statusOptions = [],
  selectedStudent,
  selectedSection,
  selectedTeamCode,
  selectedDocType,
  selectedStatus = '',
  onStudentChange,
  onSectionChange,
  onTeamCodeChange,
  onDocTypeChange,
  onStatusChange,
  onClear,
}) {
  const showStatus = typeof onStatusChange === 'function' && statusOptions.length > 0;

  return (
    <section className="teacher-filter-panel" aria-label="Submission Filters">
      <div className="teacher-filter-panel__header">
        <h2 className="teacher-filter-panel__title">Quick Filters</h2>
        <button type="button" className="btn" onClick={onClear}>Reset Filters</button>
      </div>

      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="student-filter" className="filter-label">
            Student Name
          </label>
          <select
            id="student-filter"
            className="filter-select"
            value={selectedStudent}
            onChange={(e) => onStudentChange(e.target.value)}
            aria-describedby="student-help"
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id || student} value={student}>
                {student}
              </option>
            ))}
          </select>
          <span id="student-help" className="sr-only">
            Filter submissions by student name
          </span>
        </div>

        <div className="filter-group">
          <label htmlFor="section-filter" className="filter-label">
            Section
          </label>
          <select
            id="section-filter"
            className="filter-select"
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            aria-describedby="section-help"
          >
            <option value="">All Sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          <span id="section-help" className="sr-only">
            Filter submissions by section (G01, G02, etc.)
          </span>
        </div>

        <div className="filter-group">
          <label htmlFor="team-filter" className="filter-label">
            Team Code
          </label>
          <select
            id="team-filter"
            className="filter-select"
            value={selectedTeamCode}
            onChange={(e) => onTeamCodeChange(e.target.value)}
            aria-describedby="team-help"
          >
            <option value="">All Teams</option>
            {teamCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <span id="team-help" className="sr-only">
            Filter submissions by team code
          </span>
        </div>
      </div>

      <div className="filter-divider"></div>

      <div className="filter-link-rows">
        <nav className="document-links" aria-label="Document Type Filters">
          <h3 className="document-links-title">Document Type</h3>
          <ul className="document-links-list">
            <li>
              <button
                type="button"
                onClick={() => onDocTypeChange('')}
                className={`document-link ${selectedDocType === '' ? 'document-link--active' : ''}`}
                title="Show all document types"
              >
                All
              </button>
            </li>
            {docTypes.map((docType) => (
              <li key={docType}>
                <button
                  type="button"
                  onClick={() => onDocTypeChange(docType)}
                  className={`document-link ${selectedDocType === docType ? 'document-link--active' : ''}`}
                  title={`Filter by ${docType}`}
                >
                  {docType}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {showStatus && (
          <nav className="document-links" aria-label="Status Filters">
            <h3 className="document-links-title">Status</h3>
            <ul className="document-links-list">
              {statusOptions.map((status) => (
                <li key={status.value || 'all'}>
                  <button
                    type="button"
                    onClick={() => onStatusChange(status.value)}
                    className={`document-link ${selectedStatus === status.value ? 'document-link--active' : ''}`}
                    title={`Filter by ${status.label} status`}
                  >
                    {status.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}

export default TeacherFilterPanel;
