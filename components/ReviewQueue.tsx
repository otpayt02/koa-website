import { StatusPill } from "./StatusPill";

const items = [
  { type: "Definition", title: "ကညီဖိ", by: "Naw K.", age: "18 min", priority: "Standard" },
  { type: "Audio pair", title: "Community welcome sentence", by: "Saw H.", age: "42 min", priority: "Audio check" },
  { type: "Translation", title: "Medical intake phrase variants", by: "Naw M.", age: "1 hr", priority: "Translator" },
  { type: "Discussion flag", title: "Context dispute on entry #142", by: "System", age: "3 hr", priority: "Moderator" }
];

export function ReviewQueue() {
  return <div className="review-list">{items.map((item) => <article key={item.title}><div><StatusPill tone={item.type === "Discussion flag" ? "red" : "gold"}>{item.type}</StatusPill><h3>{item.title}</h3><p>Submitted by {item.by} · {item.age} ago</p></div><div><span>{item.priority}</span><button type="button" className="button button--quiet">Open review</button></div></article>)}</div>;
}
