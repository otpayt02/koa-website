import { AsyncForm } from "./FormStatus";
import { Input, Select, Textarea } from "./Input";
import type { Lang, Messages } from "./i18n";

export function ContributionForm({ messages, copy }: { lang: Lang; messages: Messages; copy: Record<"eyebrow" | "title" | "word" | "translation" | "type" | "dialect" | "definition", string> }) {
  return (
    <AsyncForm endpoint="/api/contribute" messages={messages}>
      <div className="form-intro"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2></div>
      <div className="form-grid">
        <Input name="word" label={copy.word} lang="ksw" required />
        <Input name="translation" label={copy.translation} required />
        <Select name="type" label={copy.type} required>
          <option value="definition">Definition</option><option value="translation">Translation variant</option><option value="example">Example sentence</option><option value="correction">Correction</option>
        </Select>
        <Select name="dialect" label={copy.dialect} required><option value="sgaw">S&apos;gaw Karen</option><option value="unsure">Not sure</option></Select>
      </div>
      <Textarea name="definition" label={copy.definition} rows={5} required hint="Tell reviewers when and how this term is used." />
      <div className="checkbox-row"><input id="source-confirm" name="rightsConfirmed" type="checkbox" value="yes" required /><label htmlFor="source-confirm">I created this contribution or have permission to share it under KOA&apos;s community language license.</label></div>
    </AsyncForm>
  );
}
