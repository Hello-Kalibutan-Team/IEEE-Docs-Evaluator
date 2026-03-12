import AppModal from '../common/AppModal';
import EvaluationReport from '../common/EvaluationReport';

function TeacherHistoryModal({
  item,
  isEditing,
  editedText,
  onEditToggle,
  onEditText,
  onSave,
  onSend,
  onCopy,
  onClose,
}) {
  const footer = isEditing ? (
    <div className="modal-actions modal-actions--end">
      <button className="btn btn--primary" onClick={onSave}>Save Changes</button>
      <button className="btn" onClick={() => onEditToggle(false)}>Cancel</button>
    </div>
  ) : (
    <div className="modal-actions modal-actions--end">
      <button className="btn" onClick={() => onEditToggle(true)}>Edit</button>
      <button className="btn" onClick={() => onCopy(item?.evaluationResult || '')}>Copy Text</button>
      <button className="btn btn--primary" onClick={onSend} disabled={item?.isSent}>
        {item?.isSent ? 'Sent to Student' : 'Send Result'}
      </button>
    </div>
  );

  return (
    <AppModal
      isOpen={Boolean(item)}
      onClose={onClose}
      title="Saved Evaluation Report"
      subtitle={item ? `File: ${item.fileName}` : ''}
      footer={footer}
    >
      {isEditing ? (
        <textarea
          className="report-textarea"
          value={editedText}
          onChange={(e) => onEditText(e.target.value)}
        />
      ) : (
        <EvaluationReport text={item?.evaluationResult}/>
      )}
    </AppModal>
  );
}

export default TeacherHistoryModal;