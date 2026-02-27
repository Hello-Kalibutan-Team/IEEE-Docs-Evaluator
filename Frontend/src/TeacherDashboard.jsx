import { useEffect, useState } from 'react';
import { getDriveFiles, deleteDriveFile, createDriveFolder, searchDriveFiles, syncSubmissionsWithBackend, analyzeDocumentWithAI, getEvaluationHistory } from './api'; 
import { supabase } from './supabaseClient';

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
    const [currentView, setCurrentView] = useState('dashboard');
    
    const [navStack, setNavStack] = useState([{ id: ROOT_ID, name: 'IEEE Root' }]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFileForAi, setSelectedFileForAi] = useState(null);
    const [aiResult, setAiResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    const currentFolder = navStack[navStack.length - 1];

    const getDisplayType = (mimeType) => {
        if (!mimeType) return 'File';
        if (mimeType === 'application/vnd.google-apps.folder') return 'Folder';
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType.includes('wordprocessingml') || mimeType.includes('officedocument')) return 'DOCX';
        return 'File';
    };

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

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const data = await getEvaluationHistory();
            setHistoryLogs(data);
        } catch (err) {
            setError("Failed to load history: " + err.message);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (currentView === 'dashboard' && !isSearching) {
            loadFiles(currentFolder.id); 
        } else if (currentView === 'reports') {
            loadHistory();
        }
    }, [currentFolder.id, isSearching, currentView]);

    const handleManualSync = async () => {
        try {
            setIsSyncing(true);
            setError('');
            await syncSubmissionsWithBackend(); 
            await loadFiles(currentFolder.id); 
            alert("Sync and organization complete!");
        } catch (err) {
            setError("Sync failed: " + err.message);
        } finally {
            setIsSyncing(false);
        }
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

    const handleAnalyzeClick = (file) => {
        setSelectedFileForAi(file);
        setAiResult('');
        setIsModalOpen(true);
    };

    const triggerAnalysis = async (modelName) => {
        setIsAnalyzing(true);
        setAiResult('');
        try {
            const data = await analyzeDocumentWithAI(selectedFileForAi.id, selectedFileForAi.name, modelName);
            setAiResult(data.analysis);
            // Refresh history after a new analysis is saved/updated
            if (currentView === 'reports') loadHistory();
        } catch (err) {
            setAiResult('Error: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
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
        root: { display: 'flex', height: '100vh', width: '100vw', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f0f2f7', overflow: 'hidden' },
        sidebar: { width: '240px', backgroundColor: '#0f172a', color: '#e2e8f0', padding: '28px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
        sidebarBrand: { fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
        sidebarRole: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '36px' },
        navItemActive: { padding: '10px 14px', borderRadius: '8px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: '600', cursor: 'pointer', marginBottom: '4px' },
        navItem: { padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer', marginBottom: '4px' },
        signOutBtn: { marginTop: 'auto', background: 'none', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left' },
        main: { flex: 1, padding: '36px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        headerTitle: { fontSize: '24px', margin: '0 0 8px 0', color: '#0F172A', fontWeight: '700' },
        breadcrumbContainer: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#64748b' },
        breadcrumbLink: { color: '#2563eb', cursor: 'pointer', textDecoration: 'none', fontWeight: '500' },
        searchInput: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' },
        newFolderBtn: { backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        refreshBtn: { backgroundColor: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        syncBtn: { backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
        card: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
        tableContainer: { maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { position: 'sticky', top: 0, padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', zIndex: 1, cursor: 'pointer' },
        td: { padding: '14px 16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
        folderName: { color: '#2563eb', cursor: 'pointer', fontWeight: '500' },
        badge: { backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
        deleteBtn: { color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' },
        analyzeBtn: { color: '#059669', background: 'none', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' },
        loadingRow: { animation: 'pulse-light 1.5s infinite ease-in-out' }
    };

    return (
        <div style={styles.root}>
            {/* Inject Animation Styles */}
            <style>
                {`
                @keyframes pulse-light {
                    0% { background-color: #ffffff; }
                    50% { background-color: #eff6ff; }
                    100% { background-color: #ffffff; }
                }
                .loading-row { animation: pulse-light 1.5s infinite ease-in-out; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}
            </style>

            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>IEEE Docs</div>
                <div style={styles.sidebarRole}>Evaluator</div>
                <nav>
                    <div 
                        style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        Dashboard
                    </div>
                    <div 
                        style={currentView === 'reports' ? styles.navItemActive : styles.navItem}
                        onClick={() => setCurrentView('reports')}
                    >
                        AI Reports
                    </div>
                </nav>
                <button onClick={() => supabase.auth.signOut()} style={styles.signOutBtn}>Sign Out</button>
            </aside>

            <main style={styles.main}>
                {error && <div style={{ color: 'red', padding: '10px', background: '#fff1f1', borderRadius: '8px' }}>{error}</div>}

                {currentView === 'dashboard' && (
                    <>
                        <header style={styles.header}>
                            <div>
                                <h1 style={styles.headerTitle}>Teacher Dashboard</h1>
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
                                    placeholder="Search Drive..." 
                                    style={styles.searchInput}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                <button onClick={() => loadFiles(currentFolder.id)} style={styles.refreshBtn}>Refresh List</button>
                                <button onClick={async () => {
                                    const name = prompt("Enter folder name:");
                                    if(name) await createDriveFolder(name, currentFolder.id);
                                    loadFiles(currentFolder.id);
                                }} style={styles.newFolderBtn}>+ New Folder</button>
                                <button onClick={handleManualSync} style={styles.syncBtn} disabled={isSyncing}>
                                    {isSyncing ? "Syncing..." : "Sync Submissions"}
                                </button>
                            </div>
                        </header>

                        <div style={styles.card}>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th} onClick={() => requestSort('name')}>Name</th>
                                            <th style={styles.th}>Type</th>
                                            <th style={styles.th} onClick={() => requestSort('date')}>Submitted At</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="loading-row">
                                                    <td colSpan="4" style={{ height: '50px', borderBottom: '1px solid #f1f5f9' }}></td>
                                                </tr>
                                            ))
                                        ) : sortedFiles.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No submissions found.</td></tr>
                                        ) : sortedFiles.map(file => {
                                            const displayType = getDisplayType(file.mimeType);
                                            return (
                                                <tr key={file.id}>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {displayType === 'Folder' ? <FolderIcon /> : <FileIcon />}
                                                            {displayType === 'Folder' ? (
                                                                <span style={styles.folderName} onClick={() => handleFolderClick(file.id, file.name)}>{file.name}</span>
                                                            ) : (
                                                                <a href={file.webViewLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1e293b', fontWeight: '500' }}>{file.name}</a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}><span style={styles.badge}>{displayType}</span></td>
                                                    <td style={styles.td}>{file.submittedAt || new Date(file.createdTime).toLocaleDateString()}</td>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {displayType !== 'Folder' && (
                                                                <button onClick={() => handleAnalyzeClick(file)} style={styles.analyzeBtn}>Analyze</button>
                                                            )}
                                                            <button onClick={() => handleDelete(file.id)} style={styles.deleteBtn}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {currentView === 'reports' && (
                    <>
                        <header style={styles.header}>
                            <div>
                                <h1 style={styles.headerTitle}>AI Evaluation History</h1>
                                <div style={styles.breadcrumbContainer}>Saved results from Supabase Database</div>
                            </div>
                            <button onClick={loadHistory} style={styles.refreshBtn}>Refresh History</button>
                        </header>

                        <div style={styles.card}>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Date Analyzed</th>
                                            <th style={styles.th}>Document Name</th>
                                            <th style={styles.th}>Model</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingHistory ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="loading-row">
                                                    <td colSpan="4" style={{ height: '50px', borderBottom: '1px solid #f1f5f9' }}></td>
                                                </tr>
                                            ))
                                        ) : historyLogs.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No evaluations saved.</td></tr>
                                        ) : historyLogs.map(log => (
                                            <tr key={log.id}>
                                                <td style={styles.td}>{new Date(log.evaluatedAt).toLocaleString()}</td>
                                                <td style={styles.td}><span style={{fontWeight: '500'}}>{log.fileName}</span></td>
                                                <td style={styles.td}><span style={styles.badge}>{log.modelUsed}</span></td>
                                                <td style={styles.td}>
                                                    <button onClick={() => setSelectedHistoryItem(log)} style={styles.analyzeBtn}>View Full Report</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* MODALS */}
                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h2 style={{marginTop: 0, color: '#1e293b'}}>Analyze: {selectedFileForAi?.name}</h2>
                            {!isAnalyzing && !aiResult && (
                                <div>
                                    <p style={{color: '#64748b'}}>Select an AI model to evaluate this document.</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button onClick={() => triggerAnalysis('openai')} style={styles.syncBtn}>Use OpenAI (GPT)</button>
                                        <button onClick={() => triggerAnalysis('openrouter')} style={{ ...styles.syncBtn, backgroundColor: '#8b5cf6' }}>Use Gemini (BYOK)</button>
                                    </div>
                                </div>
                            )}
                            {isAnalyzing && <div style={{ padding: '20px', textAlign: 'center', color: '#2563eb', fontWeight: '500' }}>AI is analyzing...</div>}
                            {aiResult && (
                                <div>
                                    <h3 style={{color: '#1e293b'}}>AI Evaluation Result:</h3>
                                    <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6' }}>{aiResult}</div>
                                </div>
                            )}
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setIsModalOpen(false)} style={styles.newFolderBtn}>Close</button></div>
                        </div>
                    </div>
                )}

                {selectedHistoryItem && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
                            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                                <h2 style={{marginTop: 0, marginBottom: '5px', color: '#1e293b'}}>Saved Evaluation Report</h2>
                                <p style={{margin: 0, color: '#64748b', fontSize: '14px'}}>File: {selectedHistoryItem.fileName}</p>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6' }}>{selectedHistoryItem.evaluationResult}</div>
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setSelectedHistoryItem(null)} style={styles.newFolderBtn}>Close Report</button></div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;