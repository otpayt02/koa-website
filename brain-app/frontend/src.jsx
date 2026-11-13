import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

async function api(path, options) {
  const token = sessionStorage.getItem('brainOperatorToken');
  const response = await fetch(path, { ...options, headers: { ...options?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${response.status})`);
  return body;
}

const size = (bytes) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
const label = (name) => name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('brainOperatorToken') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState('overview');
  const [incoming, setIncoming] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [nextIncoming, nextProcessed] = await Promise.all([
        api('/api/inbox/new'), api('/api/inbox/processed'),
      ]);
      setIncoming(nextIncoming.items || []);
      setProcessed(nextProcessed.items || []);
      setUpdated(new Date());
    } catch (cause) {
      setUpdated(null);
      setIncoming([]);
      setProcessed([]);
      setError(`Could not load the inbox. ${cause.message} Check that the Brain backend is running, then try again.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) refresh(); }, [refresh, token]);
  useEffect(() => { if (token) api('/api/sync/status').then(setSyncStatus).catch(() => {}); }, [token]);
  useEffect(() => {
    if (!token || syncStatus?.status !== 'running') return undefined;
    const timer = window.setInterval(async () => {
      try {
        const next = await api('/api/sync/status');
        setSyncStatus(next);
        if (next.status === 'completed') refresh();
      } catch (cause) {
        setError(`Could not read sync status. ${cause.message}`);
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [token, syncStatus?.status, refresh]);
  useEffect(() => {
    if (!selected) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selected]);

  async function runProcess(path) {
    setBusy(path || 'all');
    setError('');
    setNotice('');
    try {
      await api(path ? '/api/inbox/mark-processed' : '/api/inbox/process', {
        method: 'POST',
        headers: path ? { 'Content-Type': 'application/json' } : undefined,
        body: path ? JSON.stringify({ item_path: path }) : undefined,
      });
      await refresh();
      setSelected(null);
      setNotice('Processing finished. The file lists are up to date.');
    } catch (cause) {
      setError(`Processing did not finish. ${cause.message}`);
    } finally {
      setBusy('');
    }
  }

  const list = view === 'processed' ? processed : incoming;
  const files = useMemo(() => list.filter((item) => item.item_path.toLowerCase().includes(search.trim().toLowerCase())), [list, search]);
  const show = (id) => { setView(id); setSearch(''); setSelected(null); };

  async function unlock(event) {
    event.preventDefault();
    sessionStorage.setItem('brainOperatorToken', tokenInput.trim());
    try {
      await api('/api/inbox/new');
      setLoginError('');
      setToken(tokenInput.trim());
      setTokenInput('');
    } catch (cause) {
      sessionStorage.removeItem('brainOperatorToken');
      setLoginError(cause.message);
    }
  }

  async function syncNow() {
    setError('');
    try {
      setSyncStatus(await api('/api/sync/run', { method: 'POST' }));
    } catch (cause) {
      setError(`Could not start sync. ${cause.message}`);
    }
  }

  async function searchKnowledge(event) {
    event.preventDefault();
    setSearching(true);
    setSearchError('');
    try {
      const result = await api(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
      setMatches(result.results || []);
    } catch (cause) {
      setSearchError(`Search failed. ${cause.message}`);
    } finally {
      setSearching(false);
    }
  }

  if (!token) return <main className="login-screen"><form className="login-card" onSubmit={unlock}><span className="brand-seal">K<span>✦</span>A</span><p className="eyebrow">KOA / PRIVATE WORKSPACE</p><h1>Company<br /><em>Brain.</em></h1><p className="lead">Enter the local operator token to open the inbox and knowledge index.</p><label htmlFor="operator-token">Operator token</label><input id="operator-token" type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} autoComplete="off" required />{loginError && <p className="login-error" role="alert">{loginError}</p>}<button className="button primary" type="submit">Unlock workspace ↗</button><p className="login-foot">The token is configured in the local, ignored brain-app/.env file. This browser keeps it for this tab session.</p></form></main>;

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-seal">K<span>✦</span>A</span><span>Karen Organization<br />of America</span></div>
      <div className="side-rule" />
      <p className="side-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {[['overview', '◫', 'Overview'], ['incoming', '↘', 'Incoming'], ['processed', '✓', 'Processed']].map(([id, icon, name]) =>
          <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => show(id)}><span aria-hidden="true">{icon}</span>{name}{id === 'incoming' && <b>{incoming.length}</b>}</button>
        )}
      </nav>
      <div className="side-bottom"><span className="local-label"><i /> LOCAL WORKSPACE</span><p>A careful record of community work.</p><a href="https://koamerica.org" target="_blank" rel="noreferrer">Visit KOA website ↗</a></div>
    </aside>
    <main className="main">
      <header className="topbar"><span className="mobile-brand">KOA / Company Brain</span><span className="topbar-title">COMPANY BRAIN</span><span className="topbar-local"><i /> Local only</span></header>
      <div className="content">
        <div className="hero">
          <div><p className="eyebrow">KOA / KNOWLEDGE WORKSPACE</p><h1>{view === 'overview' ? <>A place for what<br /><em>we know.</em></> : view === 'incoming' ? <>The incoming<br /><em>inbox.</em></> : <>The work,<br /><em>remembered.</em></>}</h1><p className="lead">{view === 'overview' ? 'A clear view of the files moving through KOA’s local knowledge system.' : view === 'incoming' ? 'Files waiting in the local inbox for the next routing pass.' : 'Files already routed into the Brain’s local indexes.'}</p></div>
          <div className="hero-actions"><button className="button outline" onClick={refresh} disabled={loading || !!busy}>↻ Refresh</button><button className="button primary" onClick={syncNow} disabled={syncStatus?.status === 'running'}>{syncStatus?.status === 'running' ? 'Syncing…' : 'Sync sources'} ↗</button></div>
        </div>
        <div aria-live="polite">{error && <div className="alert error"><span>!</span><p>{error}</p><button onClick={refresh}>Retry</button></div>}{notice && <div className="alert success"><span>✓</span><p>{notice}</p><button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}</div>
        {view === 'overview' && <section className="stats" aria-label="Workspace summary">
          <div className="stat red"><div className="stat-label">01 / INCOMING <span>↗</span></div><strong>{loading || !updated ? '—' : String(incoming.length).padStart(2, '0')}</strong><p>Files waiting to be routed</p><button onClick={() => show('incoming')}>View incoming →</button></div>
          <div className="stat"><div className="stat-label">02 / PROCESSED <span>✓</span></div><strong>{loading || !updated ? '—' : String(processed.length).padStart(2, '0')}</strong><p>Files in the processed archive</p><button onClick={() => show('processed')}>View processed →</button></div>
          <div className="stat workflow"><div className="stat-label">THE WORKFLOW</div><p><b>01</b> Place a file in <code>inbox/new</code></p><p><b>02</b> Run a pass or wait for the worker</p><p><b>03</b> Review it in processed files</p></div>
        </section>}
        <div className="section-heading"><div><p className="eyebrow">{view === 'overview' ? 'CURRENT ACTIVITY' : view === 'incoming' ? 'TO BE ROUTED' : 'ARCHIVE'}</p><h2>{view === 'overview' ? 'In the queue' : view === 'incoming' ? 'Incoming files' : 'Processed files'}</h2></div>{view === 'overview' ? <button className="text-link" onClick={() => show('incoming')}>Open inbox ↗</button> : <span className="file-count">{loading ? '…' : list.length} FILES</span>}</div>
        <section className="file-panel" aria-label={view === 'processed' ? 'Processed files' : 'Incoming files'}>
          <div className="toolbar"><label className="search"><span aria-hidden="true">⌕</span><span className="sr-only">Search files by path</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files by name or path" /></label><span className="updated">{updated ? `Updated ${updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for backend'}</span></div>
          <div className="table-wrap"><table><thead><tr><th>FILE</th><th>LOCATION</th><th>SIZE</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{!loading && files.map((item) => <tr key={item.item_path}><td><button className="file-button" onClick={() => setSelected({ ...item, bucket: view === 'processed' ? 'processed' : 'incoming' })}><span className="file-icon">▤</span>{label(item.name)}</button></td><td className="path">{item.item_path}</td><td className="size">{size(item.size_bytes)}</td><td><button className="row-action" aria-label={`View ${item.name}`} onClick={() => setSelected({ ...item, bucket: view === 'processed' ? 'processed' : 'incoming' })}>↗</button></td></tr>)}</tbody></table></div>
          {loading ? <div className="empty" role="status">Loading local files…</div> : !updated ? <div className="empty">The file list is unavailable until the Brain backend responds.</div> : files.length === 0 && <div className="empty"><span aria-hidden="true">✳</span><h3>{search ? 'No matching files' : view === 'processed' ? 'No processed files yet' : 'The inbox is clear'}</h3><p>{search ? 'Try another file name or path.' : view === 'processed' ? 'Processed files will appear here after a routing pass.' : 'Add a file to inbox/new on this computer. The worker will route it automatically, or you can run a pass here.'}</p></div>}
        </section>
        <section className="knowledge-panel" aria-label="Knowledge search"><div className="section-heading"><div><p className="eyebrow">LOCAL VECTOR INDEX</p><h2>Find what we know</h2></div><span className="file-count">LEXICAL MATCHES</span></div><p>Search processed records by similar words and characters. This local index does not translate or infer meaning.</p><form onSubmit={searchKnowledge} className="knowledge-form"><label className="sr-only" htmlFor="knowledge-query">Search knowledge</label><input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the knowledge index" required maxLength={500} /><button className="button primary" disabled={searching}>{searching ? 'Searching…' : 'Search →'}</button></form>{searchError && <p className="login-error" role="alert">{searchError}</p>}{matches.map((match, number) => <article className="knowledge-result" key={`${match.path}-${number}`}><span>{match.source.toUpperCase()} · {Math.round(match.score * 100)}% MATCH</span><h3>{match.title}</h3><p>{match.excerpt}</p><small>{match.path}</small></article>)}</section>
        {syncStatus && <div className="sync-status" role="status"><strong>Source sync: {syncStatus.status}</strong>{syncStatus.connections && <p>GitHub: ready for manual sync · Drive: {syncStatus.connections.drive_ready ? 'ready' : 'awaiting OAuth'} · Signal: {syncStatus.connections.signal_ready ? 'configured' : 'awaiting group setup'}</p>}{syncStatus.error && <p>{syncStatus.error}</p>}{syncStatus.status === 'completed' && <p>GitHub {syncStatus.results?.github?.ingested ?? 0} new · Drive {syncStatus.results?.drive?.status === 'not_configured' ? 'not configured' : `${syncStatus.results?.drive?.ingested ?? 0} new`} · Index {syncStatus.results?.knowledge?.documents ?? 0} documents</p>}</div>}
        <div className="safety"><span aria-hidden="true">◇</span><p><strong>Local prototype.</strong> This workspace has one local operator token, not individual executive accounts or a group retention policy. Approve exact sources before importing sensitive material.</p></div>
      </div>
    </main>
    {selected && <div className="backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="drawer" role="dialog" aria-modal="true" aria-label={`File details for ${selected.name}`}><button className="close" onClick={() => setSelected(null)} aria-label="Close file details">×</button><p className="eyebrow">{selected.bucket === 'incoming' ? 'INCOMING FILE' : 'PROCESSED FILE'}</p><span className="drawer-icon">▤</span><h2>{label(selected.name)}</h2><p className="drawer-intro">File details from the local Brain inbox.</p><dl><div><dt>File name</dt><dd>{selected.name}</dd></div><div><dt>Relative path</dt><dd>{selected.item_path}</dd></div><div><dt>Size</dt><dd>{size(selected.size_bytes)}</dd></div><div><dt>Status</dt><dd>{selected.bucket === 'incoming' ? 'Waiting to process' : 'Processed'}</dd></div></dl><p className="drawer-help">File contents are stored locally and are not displayed in this view.</p>{selected.bucket === 'incoming' && <button className="button primary drawer-action" disabled={!!busy} onClick={() => runProcess(selected.item_path)}>{busy === selected.item_path ? 'Processing…' : 'Process this file'} ↗</button>}</aside></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
