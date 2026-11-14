import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
const Brain3D = lazy(() => import('./Brain3D.jsx').then((module) => ({ default: module.Brain3D })));
import './style.css';
import './brain.css';

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
  const [graph, setGraph] = useState(null);
  const [graphError, setGraphError] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [editorial, setEditorial] = useState({ articles: [], suggestions: [], drafts: [], slots: [] });
  const [draftForm, setDraftForm] = useState({ headline: '', source_url: '', angle_en: '' });

  const refreshEditorial = useCallback(async () => {
    try {
      const [news, ideas, drafts, slots] = await Promise.all([
        api('/api/news'), api('/api/commentary/suggestions'), api('/api/commentary'), api('/api/commentary/schedule'),
      ]);
      setEditorial({ articles: news.articles || [], suggestions: ideas.suggestions || [], drafts: drafts.drafts || [], slots: slots.draft_review_slots || [] });
    } catch (cause) { setError(`Could not load the editorial desk. ${cause.message}`); }
  }, []);

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
  useEffect(() => { if (token && view === 'editorial') refreshEditorial(); }, [token, view, refreshEditorial]);
  useEffect(() => { if (token) api('/api/sync/status').then(setSyncStatus).catch(() => {}); }, [token]);
  useEffect(() => {
    if (!token || !updated) return;
    api('/api/brain/graph').then((next) => { setGraph(next); setGraphError(''); }).catch((cause) => setGraphError(cause.message));
  }, [token, updated]);
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

  async function saveDraft(event) {
    event.preventDefault();
    setBusy('draft'); setError('');
    try {
      await api('/api/commentary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draftForm) });
      setDraftForm({ headline: '', source_url: '', angle_en: '' });
      setNotice('Draft saved privately. Editorial and language review are required before publication.');
      await refreshEditorial();
    } catch (cause) { setError(`Could not save draft. ${cause.message}`); }
    finally { setBusy(''); }
  }

  if (!token) return <main className="login-screen"><form className="login-card" onSubmit={unlock}><span className="brand-seal">K<span>✦</span>A</span><p className="eyebrow">KOA / PRIVATE WORKSPACE</p><h1>Company<br /><em>Brain.</em></h1><p className="lead">Enter the local operator token to open the inbox and knowledge index.</p><label htmlFor="operator-token">Operator token</label><input id="operator-token" type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} autoComplete="off" required />{loginError && <p className="login-error" role="alert">{loginError}</p>}<button className="button primary" type="submit">Unlock workspace ↗</button><p className="login-foot">The token is configured in the local, ignored brain-app/.env file. This browser keeps it for this tab session.</p></form></main>;

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-seal">K<span>✦</span>A</span><span>Karen Organization<br />of America</span></div>
      <div className="side-rule" />
      <p className="side-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {[['overview', '◫', 'Overview'], ['incoming', '↘', 'Incoming'], ['processed', '✓', 'Processed'], ['editorial', '✎', 'Editorial desk']].map(([id, icon, name]) =>
          <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => show(id)}><span aria-hidden="true">{icon}</span>{name}{id === 'incoming' && <b>{incoming.length}</b>}</button>
        )}
      </nav>
      <div className="side-bottom"><span className="local-label"><i /> LOCAL WORKSPACE</span><p>A careful record of community work.</p><a href="https://koamerica.org" target="_blank" rel="noreferrer">Visit KOA website ↗</a></div>
    </aside>
    <main className="main">
      <header className="topbar"><span className="mobile-brand">KOA / Company Brain</span><span className="topbar-title">COMPANY BRAIN</span><span className="topbar-local"><i /> Local only</span></header>
      <div className="content">
        <div className="hero">
          <div><p className="eyebrow">KOA / KNOWLEDGE WORKSPACE</p><h1>{view === 'overview' ? <>A place for what<br /><em>we know.</em></> : view === 'incoming' ? <>The incoming<br /><em>inbox.</em></> : view === 'editorial' ? <>A place for<br /><em>careful words.</em></> : <>The work,<br /><em>remembered.</em></>}</h1><p className="lead">{view === 'overview' ? 'A clear view of the files moving through KOA’s local knowledge system.' : view === 'incoming' ? 'Files waiting in the local inbox for the next routing pass.' : view === 'editorial' ? 'Public sources, private drafts, and human review before any public statement.' : 'Files already routed into the Brain’s local indexes.'}</p></div>
          <div className="hero-actions"><button className="button outline" onClick={refresh} disabled={loading || !!busy}>↻ Refresh</button><button className="button primary" onClick={syncNow} disabled={syncStatus?.status === 'running'}>{syncStatus?.status === 'running' ? 'Syncing…' : 'Sync sources'} ↗</button></div>
        </div>
        <div aria-live="polite">{error && <div className="alert error"><span>!</span><p>{error}</p><button onClick={refresh}>Retry</button></div>}{notice && <div className="alert success"><span>✓</span><p>{notice}</p><button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}</div>
        {view === 'overview' && <section className="stats" aria-label="Workspace summary">
          <div className="stat red"><div className="stat-label">01 / INCOMING <span>↗</span></div><strong>{loading || !updated ? '—' : String(incoming.length).padStart(2, '0')}</strong><p>Files waiting to be routed</p><button onClick={() => show('incoming')}>View incoming →</button></div>
          <div className="stat"><div className="stat-label">02 / PROCESSED <span>✓</span></div><strong>{loading || !updated ? '—' : String(processed.length).padStart(2, '0')}</strong><p>Files in the processed archive</p><button onClick={() => show('processed')}>View processed →</button></div>
          <div className="stat workflow"><div className="stat-label">THE WORKFLOW</div><p><b>01</b> Place a file in <code>inbox/new</code></p><p><b>02</b> Run a pass or wait for the worker</p><p><b>03</b> Review it in processed files</p></div>
        </section>}
        {view === 'overview' && <section className="brain-panel" aria-label="Knowledge map">
          <div className="section-heading"><div><p className="eyebrow">LOCAL KNOWLEDGE MAP</p><h2>See the connections.</h2></div><span className="file-count">{graph ? `${graph.nodes.length} NODES · ${graph.edges.length} LINKS` : 'LOADING'}</span></div>
          <p>Each point is an indexed record. Lines show character similarity in the local vector index; they do not assert that two records mean the same thing.</p>
          {graphError && <p className="login-error" role="alert">Could not load the map: {graphError}</p>}
          {graph?.nodes.length ? <><Suspense fallback={<div className="brain-canvas" role="status">Loading map…</div>}><Brain3D graph={graph} onSelect={setSelectedNode} /></Suspense><div className="brain-map-bottom"><div className="brain-node-list" aria-label="Knowledge nodes">{graph.nodes.map((node) => <button key={node.id} className={selectedNode?.id === node.id ? 'active' : ''} onClick={() => setSelectedNode(node)}><i className={`source-${node.source}`} />{node.title}</button>)}</div><div className="brain-node-detail" aria-live="polite">{selectedNode ? <><span className="eyebrow">{selectedNode.source.toUpperCase()} RECORD</span><h3>{selectedNode.title}</h3><p>{selectedNode.excerpt}</p></> : <p>Select a point or choose a record from the list.</p>}</div></div></> : graph && <div className="empty"><h3>The map is waiting for records.</h3><p>Use Sync sources to bring approved files into the local index.</p></div>}
        </section>}
        {view === 'editorial' && <section className="editorial-desk" aria-label="Editorial desk">
          <div className="section-heading"><div><p className="eyebrow">SOURCED INTAKE</p><h2>Headlines for review</h2></div><button className="text-link" onClick={refreshEditorial}>Refresh ↗</button></div>
          <p>These are attributed RSS headlines. Open and verify the original reporting before writing KOA commentary.</p>
          <div className="editorial-grid"><div><h3>Public sources · {editorial.articles.length}</h3><ul className="editorial-list">{editorial.articles.slice(0, 20).map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title} ↗</a><small>{item.source} · {item.published}</small><button type="button" onClick={() => setDraftForm({ headline: item.title, source_url: item.url, angle_en: '' })}>Use as source</button></li>)}</ul>{!editorial.articles.length && <p>No cached headlines yet. Check the news worker.</p>}</div><div><h3>Private draft</h3><p>Suggested review question: {editorial.suggestions[0]?.review_question || 'What needs independent verification?'}</p><form className="editorial-form" onSubmit={saveDraft}><label>Headline<input required minLength={5} maxLength={300} value={draftForm.headline} onChange={(event) => setDraftForm({ ...draftForm, headline: event.target.value })} /></label><label>HTTPS source<input required type="url" pattern="https://.*" value={draftForm.source_url} onChange={(event) => setDraftForm({ ...draftForm, source_url: event.target.value })} /></label><label>English angle<textarea required minLength={10} maxLength={2000} value={draftForm.angle_en} onChange={(event) => setDraftForm({ ...draftForm, angle_en: event.target.value })} /></label><button className="button primary" disabled={busy === 'draft'}>{busy === 'draft' ? 'Saving…' : 'Save private draft'}</button></form><h3>Review slots</h3><p>Monday / Wednesday / Friday · 9 a.m. Central. These are planning slots, not automatic posts.</p><ul>{editorial.slots.slice(0, 3).map((slot) => <li key={slot}>{new Date(slot).toLocaleString()}</li>)}</ul><h3>Saved drafts · {editorial.drafts.length}</h3><ul>{editorial.drafts.map((draft) => <li key={draft.id}>{draft.headline} · {draft.status} · {draft.translation_status}</li>)}</ul></div></div>
        </section>}
        {view !== 'editorial' && <div className="section-heading"><div><p className="eyebrow">{view === 'overview' ? 'CURRENT ACTIVITY' : view === 'incoming' ? 'TO BE ROUTED' : 'ARCHIVE'}</p><h2>{view === 'overview' ? 'In the queue' : view === 'incoming' ? 'Incoming files' : 'Processed files'}</h2></div>{view === 'overview' ? <button className="text-link" onClick={() => show('incoming')}>Open inbox ↗</button> : <span className="file-count">{loading ? '…' : list.length} FILES</span>}</div>}
        {view !== 'editorial' && <section className="file-panel" aria-label={view === 'processed' ? 'Processed files' : 'Incoming files'}>
          <div className="toolbar"><label className="search"><span aria-hidden="true">⌕</span><span className="sr-only">Search files by path</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files by name or path" /></label><span className="updated">{updated ? `Updated ${updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Waiting for backend'}</span></div>
          <div className="table-wrap"><table><thead><tr><th>FILE</th><th>LOCATION</th><th>SIZE</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{!loading && files.map((item) => <tr key={item.item_path}><td><button className="file-button" onClick={() => setSelected({ ...item, bucket: view === 'processed' ? 'processed' : 'incoming' })}><span className="file-icon">▤</span>{label(item.name)}</button></td><td className="path">{item.item_path}</td><td className="size">{size(item.size_bytes)}</td><td><button className="row-action" aria-label={`View ${item.name}`} onClick={() => setSelected({ ...item, bucket: view === 'processed' ? 'processed' : 'incoming' })}>↗</button></td></tr>)}</tbody></table></div>
          {loading ? <div className="empty" role="status">Loading local files…</div> : !updated ? <div className="empty">The file list is unavailable until the Brain backend responds.</div> : files.length === 0 && <div className="empty"><span aria-hidden="true">✳</span><h3>{search ? 'No matching files' : view === 'processed' ? 'No processed files yet' : 'The inbox is clear'}</h3><p>{search ? 'Try another file name or path.' : view === 'processed' ? 'Processed files will appear here after a routing pass.' : 'Add a file to inbox/new on this computer. The worker will route it automatically, or you can run a pass here.'}</p></div>}
        </section>}
        {view !== 'editorial' && <section className="knowledge-panel" aria-label="Knowledge search"><div className="section-heading"><div><p className="eyebrow">LOCAL VECTOR INDEX</p><h2>Find what we know</h2></div><span className="file-count">LEXICAL MATCHES</span></div><p>Search processed records by similar words and characters. This local index does not translate or infer meaning.</p><form onSubmit={searchKnowledge} className="knowledge-form"><label className="sr-only" htmlFor="knowledge-query">Search knowledge</label><input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the knowledge index" required maxLength={500} /><button className="button primary" disabled={searching}>{searching ? 'Searching…' : 'Search →'}</button></form>{searchError && <p className="login-error" role="alert">{searchError}</p>}{matches.map((match, number) => <article className="knowledge-result" key={`${match.path}-${number}`}><span>{match.source.toUpperCase()} · {Math.round(match.score * 100)}% MATCH</span><h3>{match.title}</h3><p>{match.excerpt}</p><small>{match.path}</small></article>)}</section>}
        {syncStatus && <div className="sync-status" role="status"><strong>Source sync: {syncStatus.status}</strong>{syncStatus.connections && <p>GitHub: ready for manual sync · Drive: {syncStatus.connections.drive_ready ? 'ready' : 'awaiting OAuth'} · Signal: {syncStatus.connections.signal_ready ? 'configured' : 'awaiting group setup'}</p>}{syncStatus.error && <p>{syncStatus.error}</p>}{syncStatus.status === 'completed' && <p>GitHub {syncStatus.results?.github?.ingested ?? 0} new · Drive {syncStatus.results?.drive?.status === 'not_configured' ? 'not configured' : `${syncStatus.results?.drive?.ingested ?? 0} new`} · Index {syncStatus.results?.knowledge?.documents ?? 0} documents</p>}</div>}
        <div className="safety"><span aria-hidden="true">◇</span><p><strong>Local prototype.</strong> This workspace has one local operator token, not individual executive accounts or a group retention policy. Approve exact sources before importing sensitive material.</p></div>
      </div>
    </main>
    {selected && <div className="backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="drawer" role="dialog" aria-modal="true" aria-label={`File details for ${selected.name}`}><button className="close" onClick={() => setSelected(null)} aria-label="Close file details">×</button><p className="eyebrow">{selected.bucket === 'incoming' ? 'INCOMING FILE' : 'PROCESSED FILE'}</p><span className="drawer-icon">▤</span><h2>{label(selected.name)}</h2><p className="drawer-intro">File details from the local Brain inbox.</p><dl><div><dt>File name</dt><dd>{selected.name}</dd></div><div><dt>Relative path</dt><dd>{selected.item_path}</dd></div><div><dt>Size</dt><dd>{size(selected.size_bytes)}</dd></div><div><dt>Status</dt><dd>{selected.bucket === 'incoming' ? 'Waiting to process' : 'Processed'}</dd></div></dl><p className="drawer-help">File contents are stored locally and are not displayed in this view.</p>{selected.bucket === 'incoming' && <button className="button primary drawer-action" disabled={!!busy} onClick={() => runProcess(selected.item_path)}>{busy === selected.item_path ? 'Processing…' : 'Process this file'} ↗</button>}</aside></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
