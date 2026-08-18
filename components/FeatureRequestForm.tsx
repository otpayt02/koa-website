import { AsyncForm } from "./FormStatus";
import { Input, Select, Textarea } from "./Input";
import type { Lang, Messages } from "./i18n";

export function FeatureRequestForm({ lang, messages, copy }: { lang: Lang; messages: Messages; copy: Record<"eyebrow" | "title" | "type" | "shortTitle" | "description" | "impact" | "email", string> }) {
  return (
    <AsyncForm endpoint="/api/collaborate" messages={messages}>
      <div className="form-intro"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2></div>
      <div className="form-grid">
        <Select name="type" label={copy.type} required><option value="feature">Website feature</option><option value="service">Community service</option><option value="collaboration">Partnership or collaboration</option></Select>
        <Input name="title" label={copy.shortTitle} required />
      </div>
      <Textarea name="description" label={copy.description} rows={5} required />
      <Textarea name="impact" label={copy.impact} rows={3} required />
      <Input name="email" label={copy.email} type="email" />
    </AsyncForm>
  );
}
