import AppModal from '../common/AppModal';
import EvaluationReport from '../common/EvaluationReport';

function StudentReportModal({ report, onClose }) {
  return (
    <AppModal
      isOpen={Boolean(report)}
      onClose={onClose}
      title="Professor's Evaluation"
      subtitle={report ? `File: ${report.fileName}` : ''}
    >
      <EvaluationReport text={report?.evaluationResult}/>
    </AppModal>
  );
}

export default StudentReportModal;
