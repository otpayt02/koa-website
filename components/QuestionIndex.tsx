type QuestionIndexItem = {
  question: "Who" | "What" | "When" | "Where" | "Why" | "How";
  answer: string;
  detail: string;
};

/**
 * Keeps the public six-question invitation consistent across KOA pages.
 * The content is supplied by each route so the component does not invent
 * program claims or translation copy.
 */
export function QuestionIndex({
  id,
  verb,
  title,
  intro,
  items,
}: {
  id: string;
  verb: "Understand" | "Provide" | "Combine" | "Show" | "Connect" | "Invite";
  title: string;
  intro: string;
  items: QuestionIndexItem[];
}) {
  return (
    <section className="question-index" aria-labelledby={`${id}-title`}>
      <div className="container question-index__layout">
        <header className="question-index__intro">
          <p className="eyebrow">{verb} · Six clear questions</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{intro}</p>
        </header>
        <dl className="question-index__list">
          {items.map((item, index) => (
            <div className="question-index__row" key={item.question}>
              <dt>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {item.question}
              </dt>
              <dd>
                <strong>{item.answer}</strong>
                <p>{item.detail}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
