import { useEffect, useMemo, useState } from 'react';
import {
  analyzeSubmission,
  fetchTeacherHistory,
  fetchTeacherSettings,
  fetchTeacherSubmissions,
  saveEvaluation,
  saveSetting,
  sendEvaluation,
} from '../services/dashboardService';
import { buildFilterOptions, extractSubmissionMeta, filterSubmissions, sortSubmissions } from '../utils/dashboardUtils';

export function useTeacherDashboard(showToast) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeamCode, setSelectedTeamCode] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReportText, setEditedReportText] = useState('');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [reportDocTypeFilter, setReportDocTypeFilter] = useState('');
  const [reportSelectedStudent, setReportSelectedStudent] = useState('');
  const [reportSelectedSection, setReportSelectedSection] = useState('');
  const [reportSelectedTeamCode, setReportSelectedTeamCode] = useState('');

  const [settings, setSettings] = useState([]);
  const [editedSettings, setEditedSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTeacherSubmissions();
      setFiles(data);
    } catch (err) {
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      setError('');
      const data = await fetchTeacherHistory();
      setHistoryLogs(data);
    } catch (err) {
      setError(`Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadSettings() {
    try {
      setLoadingSettings(true);
      setError('');
      const data = await fetchTeacherSettings();
      setSettings(data);
      setEditedSettings({});
    } catch (err) {
      setError(`Failed to load settings: ${err.message}`);
    } finally {
      setLoadingSettings(false);
    }
  }

  useEffect(() => {
    if (currentView === 'dashboard') loadSubmissions();
    if (currentView === 'reports') loadHistory();
    if (currentView === 'settings') loadSettings();
  }, [currentView]);

  const filterOptions = useMemo(() => buildFilterOptions(files), [files]);

  const filteredFiles = useMemo(
    () =>
      filterSubmissions(files, {
        selectedStudent,
        selectedSection,
        selectedTeamCode,
        selectedDocType,
        searchQuery,
      }),
    [files, selectedStudent, selectedSection, selectedTeamCode, selectedDocType, searchQuery],
  );

  const sortedFiles = useMemo(() => sortSubmissions(filteredFiles, sortConfig), [filteredFiles, sortConfig]);

  const reportDocTypeOptions = useMemo(
    () =>
      [...new Set(historyLogs.map((item) => extractSubmissionMeta(item.fileName).documentType).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [historyLogs],
  );

  const reportFilterOptions = useMemo(() => {
    const students = new Set();
    const sections = new Set();
    const teamCodes = new Set();

    historyLogs.forEach((item) => {
      const meta = extractSubmissionMeta(item.fileName);
      if (meta.studentName) students.add(meta.studentName);
      if (meta.section) sections.add(meta.section);
      if (meta.teamCode) teamCodes.add(meta.teamCode);
    });

    return {
      students: [...students].sort((a, b) => a.localeCompare(b)),
      sections: [...sections].sort((a, b) => a.localeCompare(b)),
      teamCodes: [...teamCodes].sort((a, b) => a.localeCompare(b)),
    };
  }, [historyLogs]);

  const filteredHistoryLogs = useMemo(() => {
    const query = reportSearchQuery.trim().toLowerCase();

    return historyLogs.filter((log) => {
      const docType = extractSubmissionMeta(log.fileName).documentType;
      const meta = extractSubmissionMeta(log.fileName);

      if (reportStatusFilter === 'sent' && !log.isSent) return false;
      if (reportStatusFilter === 'pending' && log.isSent) return false;
      if (reportDocTypeFilter && docType !== reportDocTypeFilter) return false;
      if (reportSelectedStudent && meta.studentName !== reportSelectedStudent) return false;
      if (reportSelectedSection && meta.section !== reportSelectedSection) return false;
      if (reportSelectedTeamCode && meta.teamCode !== reportSelectedTeamCode) return false;

      if (query) {
        const searchable = [
          log.fileName,
          log.isSent ? 'sent' : 'pending',
          log.evaluatedAt,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [
    historyLogs,
    reportSearchQuery,
    reportStatusFilter,
    reportDocTypeFilter,
    reportSelectedStudent,
    reportSelectedSection,
    reportSelectedTeamCode,
  ]);

  function clearReportFilters() {
    setReportSelectedStudent('');
    setReportSelectedSection('');
    setReportSelectedTeamCode('');
    setReportStatusFilter('');
    setReportDocTypeFilter('');
    setReportSearchQuery('');
  }

  async function handleManualSync() {
    if (loading || isSyncing) return;
    try {
      setIsSyncing(true);
      setError('');
      const data = await fetchTeacherSubmissions();
      setFiles(data);
      showToast('Submissions synced successfully.', 'success');
    } catch (err) {
      setError(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }

  function requestSort(key) {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  }

  function clearFilters() {
    setSelectedStudent('');
    setSelectedSection('');
    setSelectedTeamCode('');
    setSelectedDocType('');
    setSearchQuery('');
  }

  function openAnalyzeModal(file) {
    setSelectedFile(file);
    setAiResult('');
    setIsAnalyzeOpen(true);
  }

  async function runAnalysis(modelName) {
    if (!selectedFile) return;
    try {
      setIsAnalyzing(true);
      setAiResult('');
      const data = await analyzeSubmission(selectedFile.id, selectedFile.name, modelName);
      setAiResult(data.analysis || data);
      if (currentView === 'reports') loadHistory();
    } catch (err) {
      setAiResult(`Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function startEditingHistory(item) {
    setSelectedHistoryItem(item);
    setEditedReportText(item.evaluationResult);
    setIsEditingReport(false);
  }

  async function saveEditedHistory() {
    if (!selectedHistoryItem) return;
    try {
      await saveEvaluation(selectedHistoryItem.id, editedReportText);
      const updated = { ...selectedHistoryItem, evaluationResult: editedReportText };
      setSelectedHistoryItem(updated);
      setHistoryLogs((prev) => prev.map((log) => (log.id === updated.id ? updated : log)));
      setIsEditingReport(false);
      showToast('Evaluation updated successfully.', 'success');
    } catch (err) {
      showToast(`Error updating report: ${err.message}`, 'error');
    }
  }

  async function sendHistoryToStudent() {
    if (!selectedHistoryItem) return;
    try {
      await sendEvaluation(selectedHistoryItem.id);
      const updated = { ...selectedHistoryItem, isSent: true };
      setSelectedHistoryItem(updated);
      setHistoryLogs((prev) => prev.map((log) => (log.id === updated.id ? updated : log)));
      showToast('Result sent to Student Dashboard.', 'success');
    } catch (err) {
      showToast(`Error sending report: ${err.message}`, 'error');
    }
  }

  function closeHistoryModal() {
    setSelectedHistoryItem(null);
    setIsEditingReport(false);
  }

  function handleSettingChange(key, value) {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAllSettings() {
    const keys = Object.keys(editedSettings);
    if (!keys.length) return;
    try {
      setIsSavingAll(true);
      await Promise.all(keys.map((key) => saveSetting(key, editedSettings[key])));
      showToast('All settings saved.', 'success');
      await loadSettings();
    } catch (err) {
      showToast(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setIsSavingAll(false);
    }
  }

  return {
    currentView,
    setCurrentView,
    files: sortedFiles,
    filterOptions,
    selectedStudent,
    selectedSection,
    selectedTeamCode,
    selectedDocType,
    searchQuery,
    loading,
    isSyncing,
    error,
    historyLogs: filteredHistoryLogs,
    allHistoryCount: historyLogs.length,
    reportDocTypeOptions,
    reportFilterOptions,
    reportSearchQuery,
    reportStatusFilter,
    reportDocTypeFilter,
    reportSelectedStudent,
    reportSelectedSection,
    reportSelectedTeamCode,
    loadingHistory,
    settings,
    loadingSettings,
    editedSettings,
    isSavingAll,
    dirtyCount: Object.keys(editedSettings).length,
    isAnalyzeOpen,
    setIsAnalyzeOpen,
    selectedFile,
    aiResult,
    isAnalyzing,
    selectedHistoryItem,
    isEditingReport,
    setIsEditingReport,
    editedReportText,
    setEditedReportText,
    handleManualSync,
    requestSort,
    setSelectedStudent,
    setSelectedSection,
    setSelectedTeamCode,
    setSelectedDocType,
    setSearchQuery,
    setReportSearchQuery,
    setReportStatusFilter,
    setReportDocTypeFilter,
    setReportSelectedStudent,
    setReportSelectedSection,
    setReportSelectedTeamCode,
    clearReportFilters,
    clearFilters,
    openAnalyzeModal,
    runAnalysis,
    loadHistory,
    startEditingHistory,
    saveEditedHistory,
    sendHistoryToStudent,
    closeHistoryModal,
    handleSettingChange,
    saveAllSettings,
    loadSettings,
  };
}
