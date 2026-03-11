import AppModal from '../common/AppModal';

function TeacherAnalyzeModal({ isOpen, file, aiResult, isAnalyzing, onClose, onRun }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Analyze: ${file?.name || ''}`}
      subtitle="Select an AI model to evaluate this submission"
    >
      {!isAnalyzing && !aiResult && (
        <div className="modal-actions">
          <button className="btn btn--openai" onClick={() => onRun('openai')}>
            Use OpenAI (GPT)
          </button>
          <button className="btn btn--gemini" onClick={() => onRun('openrouter')}>
            Use Gemini
          </button>
        </div>
      )}

      {isAnalyzing && <p className="muted">Extracting text and running analysis...</p>}
      {aiResult && <div className="report-content">{aiResult}</div>}
    </AppModal>
  );
}

export default TeacherAnalyzeModal;
