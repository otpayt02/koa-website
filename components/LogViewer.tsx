const logs = [
  ["14:22:08", "dictionary.review", "entry_148 approved by reviewer_07"],
  ["14:18:41", "audio.upload", "pair_390 entered moderation"],
  ["14:11:03", "translation.request", "request_84 created · medical"],
  ["13:57:29", "community.flag", "discussion_19 queued for review"]
];

export function LogViewer() {
  return <div className="log-viewer" aria-label="Recent audit log"><div className="log-head"><strong>Recent activity</strong><span>Structured audit log</span></div>{logs.map(([time, event, detail]) => <div className="log-row" key={time}><time>{time}</time><code>{event}</code><span>{detail}</span></div>)}</div>;
}
