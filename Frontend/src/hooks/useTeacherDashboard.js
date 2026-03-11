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
import { sortSubmissions } from '../utils/dashboardUtils';

export function useTeacherDashboard(showToast) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReportText, setEditedReportText] = useState('');

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

  const sortedFiles = useMemo(() => sortSubmissions(files, sortConfig), [files, sortConfig]);

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
    loading,
    isSyncing,
    error,
    historyLogs,
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
