export function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

export function getDisplayType(mimeType) {
  return mimeType === 'application/vnd.google-apps.document' ? 'Google Doc' : 'Document';
}

export function sortSubmissions(files, sortConfig) {
  const items = [...files];
  return items.sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.submittedAt) - new Date(b.submittedAt)
        : new Date(b.submittedAt) - new Date(a.submittedAt);
    }
    return 0;
  });
}
