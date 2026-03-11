import PanelHeader from '../../components/common/PanelHeader';
import ToastMessage from '../../components/common/ToastMessage';
import TeacherAnalyzeModal from '../../components/teacher/TeacherAnalyzeModal';
import TeacherHistoryModal from '../../components/teacher/TeacherHistoryModal';
import TeacherHistoryTable from '../../components/teacher/TeacherHistoryTable';
import TeacherSettingsPanel from '../../components/teacher/TeacherSettingsPanel';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import TeacherSubmissionsTable from '../../components/teacher/TeacherSubmissionsTable';
import { useTeacherDashboard } from '../../hooks/useTeacherDashboard';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import '../../styles/pages/teacher-dashboard.css';
import '../../styles/components/layout.css';

function TeacherDashboardPage() {
  const { toast, showToast } = useToast();
  const { themeMode, setThemeMode } = useTheme();
  const vm = useTeacherDashboard(showToast);

  return (
    <div className="layout layout--teacher">
      <ToastMessage toast={toast} />

      <TeacherSidebar
        currentView={vm.currentView}
        onNavigate={vm.setCurrentView}
      />

      <main className="layout__main">
        {vm.error && <div className="error-box">{vm.error}</div>}

        {vm.currentView === 'dashboard' && (
          <>
            <PanelHeader
              title="Live Submissions Dashboard"
              subtitle="Sourced directly from the Google Sheets tracker"
              actions={
                <button className="btn btn--primary" onClick={vm.handleManualSync} disabled={vm.isSyncing}>
                  {vm.isSyncing ? 'Fetching Updates...' : 'Sync Latest Submissions'}
                </button>
              }
            />
            <TeacherSubmissionsTable
              files={vm.files}
              loading={vm.loading}
              isSyncing={vm.isSyncing}
              onSort={vm.requestSort}
              onAnalyze={vm.openAnalyzeModal}
            />
          </>
        )}

        {vm.currentView === 'reports' && (
          <>
            <PanelHeader
              title="AI Evaluation History"
              subtitle="Saved results from Supabase Database"
            />
            <TeacherHistoryTable
              logs={vm.historyLogs}
              loading={vm.loadingHistory}
              onView={vm.startEditingHistory}
              onRefresh={vm.loadHistory}
            />
          </>
        )}

        {vm.currentView === 'settings' && (
          <>
            <PanelHeader
              title="System Settings"
              subtitle="Manage API keys, tracker mappings, and submission columns"
            />
            <TeacherSettingsPanel
              settings={vm.settings}
              editedSettings={vm.editedSettings}
              loading={vm.loadingSettings}
              dirtyCount={vm.dirtyCount}
              isSavingAll={vm.isSavingAll}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              onSettingChange={vm.handleSettingChange}
              onSave={vm.saveAllSettings}
              onDiscard={() => {
                vm.loadSettings();
              }}
            />
          </>
        )}
      </main>

      <TeacherAnalyzeModal
        isOpen={vm.isAnalyzeOpen}
        file={vm.selectedFile}
        aiResult={vm.aiResult}
        isAnalyzing={vm.isAnalyzing}
        onClose={() => vm.setIsAnalyzeOpen(false)}
        onRun={vm.runAnalysis}
      />

      <TeacherHistoryModal
        item={vm.selectedHistoryItem}
        isEditing={vm.isEditingReport}
        editedText={vm.editedReportText}
        onEditToggle={vm.setIsEditingReport}
        onEditText={vm.setEditedReportText}
        onSave={vm.saveEditedHistory}
        onSend={vm.sendHistoryToStudent}
        onCopy={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Evaluation text copied to clipboard.', 'success');
        }}
        onClose={vm.closeHistoryModal}
      />
    </div>
  );
}

export default TeacherDashboardPage;
