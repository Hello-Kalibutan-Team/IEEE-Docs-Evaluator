import { useEffect, useState } from 'react';
import { getDriveFiles, deleteDriveFile, createDriveFolder, searchDriveFiles, syncSubmissionsWithBackend } from './api'; 
import { supabase } from './supabaseClient';

// --- SVG Icons ---
const FolderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#2563eb' }}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

const FileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#64748b' }}>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

const TeacherDashboard = ({ user }) => {
    const ROOT_ID = '1coTNznsUzG_n7Oztc8EZJ4wpxlssbQ-z';
    const [navStack, setNavStack] = useState([{ id: ROOT_ID, name: 'IEEE Root' }]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false); // New state for backend process
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const currentFolder = navStack[navStack.length - 1];

    const getDisplayType = (mimeType) => {
        if (!mimeType) return 'File';
        if (mimeType === 'application/vnd.google-apps.folder') return 'Folder';
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType.includes('wordprocessingml') || mimeType.includes('officedocument')) return 'DOCX';
        return 'File';
    };

    // --- Core Data Loader: Just pulls the current file list ---
    const loadFiles = async (folderId) => {
        try {
            setLoading(true);
            setError('');
            const data = await getDriveFiles(folderId);
            setFiles(data);
        } catch (err) {
            setError("Failed to load: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSearching) {
            loadFiles(currentFolder.id);
        }
    }, [currentFolder.id, isSearching]); 

    // --- Manual Sync: Triggers Spreadsheet Reading & Routing ---
    const handleManualSync = async () => {
        try {
            setIsSyncing(true);
            setError('');
            // Triggers the Java logic to read Sheet and replicate files
            await syncSubmissionsWithBackend(); 
            // Refresh current view to show newly organized folders/files
            await loadFiles(currentFolder.id); 
            alert("Sync and organization complete!");
        } catch (err) {
            setError("Sync failed: " + err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    // --- Manual Refresh: Just re-lists files without running the Sync logic ---
    const handleManualRefresh = () => {
        loadFiles(currentFolder.id);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 2) {
            setIsSearching(true);
            setLoading(true);
            try {
                const results = await searchDriveFiles(value);
                setFiles(results);
            } catch (err) {
                setError("Search failed: " + err.message);
            } finally {
                setLoading(false);
            }
        } else if (value.trim().length === 0) {
            setIsSearching(false);
            loadFiles(currentFolder.id);
        }
    };

    const handleFolderClick = (folderId, folderName) => {
        setSearchTerm('');
        setIsSearching(false);
        setNavStack([...navStack, { id: folderId, name: folderName }]);
    };

    const handleBreadcrumbClick = (index) => {
        setSearchTerm('');
        setIsSearching(false);
        setNavStack(navStack.slice(0, index + 1));
    };

    const handleCreateFolder = async () => {
        if (isSearching) {
            alert("Please exit search mode to create folders.");
            return;
        }
        const folderName = prompt("Enter new folder name:");
        if (!folderName) return;
        try {
            const newFolder = await createDriveFolder(folderName, currentFolder.id);
            setFiles([newFolder, ...files]);
        } catch (err) {
            alert("Creation failed: " + err.message);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            setFiles(files.filter(f => f.id !== fileId));
            await deleteDriveFile(fileId);
        } catch (err) {
            alert("Delete failed: " + err.message);
            loadFiles(currentFolder.id);
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedFiles = [...files].sort((a, b) => {
        const typeA = getDisplayType(a.mimeType);
        const typeB = getDisplayType(b.mimeType);
        
        if (typeA === 'Folder' && typeB !== 'Folder') return -1;
        if (typeA !== 'Folder' && typeB === 'Folder') return 1;

        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc' 
                ? new Date(a.createdTime) - new Date(b.createdTime) 
                : new Date(b.createdTime) - new Date(a.createdTime);
        }
        return 0;
    });

    const styles = {
        root: { display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f0f2f7' },
        sidebar: { width: '240px', backgroundColor: '#0f172a', color: '#e2e8f0', padding: '28px 20px', display: 'flex', flexDirection: 'column' },
        sidebarBrand: { fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
        sidebarRole: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '36px' },
        navItemActive: { padding: '10px 14px', borderRadius: '8px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: '600', cursor: 'pointer', marginBottom: '4px' },
        navItem: { padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer', marginBottom: '4px' },
        signOutBtn: { marginTop: 'auto', background: 'none', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left' },
        main: { flex: 1, padding: '36px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        breadcrumbContainer: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#64748b' },
        breadcrumbLink: { color: '#2563eb', cursor: 'pointer', textDecoration: 'none', fontWeight: '500' },
        searchInput: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', fontSize: '14px', outline: 'none' },
        newFolderBtn: { backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        refreshBtn: { backgroundColor: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        syncBtn: { backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        card: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer' },
        td: { padding: '14px 16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
        folderName: { color: '#2563eb', cursor: 'pointer', fontWeight: '500' },
        badge: { backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        deleteBtn: { color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' }
    };

    return (
        <div style={styles.root}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>IEEE Docs</div>
                <div style={styles.sidebarRole}>Evaluator</div>
                <nav>
                    <div style={styles.navItemActive}>Dashboard</div>
                    <div style={styles.navItem}>AI Reports</div>
                    <div style={styles.navItem}>Settings</div>
                </nav>
                <button onClick={() => supabase.auth.signOut()} style={styles.signOutBtn}>Sign Out</button>
            </aside>

            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Teacher Dashboard</h1>
                        <div style={styles.breadcrumbContainer}>
                            {!isSearching ? navStack.map((folder, index) => (
                                <span key={folder.id}>
                                    <span 
                                        style={index === navStack.length - 1 ? {} : styles.breadcrumbLink}
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {folder.name}
                                    </span>
                                    {index < navStack.length - 1 && <span> / </span>}
                                </span>
                            )) : <span style={{ fontWeight: '600', color: '#2563eb' }}>Search Results</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            type="text" 
                            placeholder="Search drive..." 
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <button onClick={handleManualRefresh} style={styles.refreshBtn}>↻ Refresh List</button>
                        <button 
                            onClick={handleManualSync} 
                            style={styles.syncBtn} 
                            disabled={isSyncing}
                        >
                            {isSyncing ? "Syncing..." : "Sync Submissions"}
                        </button>
                        <button onClick={handleCreateFolder} style={styles.newFolderBtn}>+ New Folder</button>
                    </div>
                </header>

                {error && <div style={{ color: 'red', padding: '10px', background: '#fff1f1', borderRadius: '8px' }}>{error}</div>}

                <div style={styles.card}>
                    {loading ? <p style={{ padding: '20px' }}>Accessing Google Drive...</p> : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th} onClick={() => requestSort('name')}>
                                        Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </th>
                                    <th style={styles.th}>Type</th>
                                    <th style={styles.th} onClick={() => requestSort('date')}>
                                        Submitted At {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                    </th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFiles.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No submissions found in this folder. Click Sync to fetch them.</td></tr>
                                ) : sortedFiles.map(file => {
                                    const displayType = getDisplayType(file.mimeType);
                                    return (
                                        <tr key={file.id}>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {displayType === 'Folder' ? <FolderIcon /> : <FileIcon />}
                                                    {displayType === 'Folder' ? (
                                                        <span 
                                                            style={styles.folderName} 
                                                            onClick={() => handleFolderClick(file.id, file.name)}
                                                        >
                                                            {file.name}
                                                        </span>
                                                    ) : (
                                                        <a 
                                                            href={file.webViewLink} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            style={{ textDecoration: 'none', color: '#1e293b', fontWeight: '500' }}
                                                        >
                                                            {file.name}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}><span style={styles.badge}>{displayType}</span></td>
                                            <td style={styles.td}>{file.submittedAt || new Date(file.createdTime).toLocaleDateString()}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleDelete(file.id)} style={styles.deleteBtn}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;