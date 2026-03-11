import { useEffect, useState } from 'react';
import { fetchStudentReports } from '../services/dashboardService';

export function useStudentReports(groupCode) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        setLoading(true);
        const data = await fetchStudentReports(groupCode);
        if (active) setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReports();
    return () => {
      active = false;
    };
  }, [groupCode]);

  return { reports, loading };
}
