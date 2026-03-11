import { useState } from 'react';
import PanelHeader from '../../components/common/PanelHeader';
import StudentReportModal from '../../components/student/StudentReportModal';
import StudentReportsTable from '../../components/student/StudentReportsTable';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useStudentReports } from '../../hooks/useStudentReports';
import '../../styles/pages/student-dashboard.css';
import '../../styles/components/layout.css';

function StudentDashboardPage({ studentData }) {
  const { reports, loading } = useStudentReports(studentData.groupCode);
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="layout layout--student">
      <StudentSidebar studentData={studentData} />

      <main className="layout__main">
        <PanelHeader
          title="My Team Evaluations"
          subtitle="View AI analysis feedback sent by your professor."
        />

        <div className="card">
          <StudentReportsTable
            reports={reports}
            loading={loading}
            onOpen={setSelectedReport}
          />
        </div>
      </main>

      <StudentReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}

export default StudentDashboardPage;
