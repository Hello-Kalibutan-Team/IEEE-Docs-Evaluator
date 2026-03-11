import AppModal from '../common/AppModal';

function StudentReportModal({ report, onClose }) {
  return (
    <AppModal
      isOpen={Boolean(report)}
      onClose={onClose}
      title="Professor's Evaluation"
      subtitle={report ? `File: ${report.fileName}` : ''}
    >
      <div className="report-content">{report?.evaluationResult}</div>
    </AppModal>
  );
}

export default StudentReportModal;
