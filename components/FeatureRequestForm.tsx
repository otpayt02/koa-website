import { AsyncForm } from "./FormStatus";
import { Input, Select, Textarea } from "./Input";
import type { Lang, Messages } from "./i18n";

export function FeatureRequestForm({ lang, messages }: { lang: Lang; messages: Messages }) {
  return (
    <AsyncForm endpoint="/api/collaborate" messages={messages}>
      <div className="form-intro"><p className="eyebrow">{lang === "ksw" ? "တဲဖျါနတၢ်ထံၣ်" : "Shape what comes next"}</p><h2>{lang === "ksw" ? "ပအဲၣ်ဒိးနၢ်ဟူနတၢ်ထံၣ်။" : "Tell us what community needs."}</h2></div>
      <div className="form-grid">
        <Select name="type" label="Request type" required><option value="feature">Website feature</option><option value="service">Community service</option><option value="collaboration">Partnership or collaboration</option></Select>
        <Input name="title" label="Short title" required />
      </div>
      <Textarea name="description" label="What should KOA consider?" rows={5} required />
      <Textarea name="impact" label="Who would this help, and how?" rows={3} required />
      <Input name="email" label="Email for follow-up (optional)" type="email" />
    </AsyncForm>
  );
}
