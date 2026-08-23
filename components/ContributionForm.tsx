import { AsyncForm } from "./FormStatus";
import { Input, Select, Textarea } from "./Input";
import type { Lang, Messages } from "./i18n";

export function ContributionForm({ lang, messages }: { lang: Lang; messages: Messages }) {
  return (
    <AsyncForm endpoint="/api/contribute" messages={messages}>
      <div className="form-intro"><p className="eyebrow">{lang === "karen" ? "ဟ့ၣ်လီၤကျိာ်တၢ်သ့ၣ်ညါ" : "Share language knowledge"}</p><h2>{lang === "karen" ? "မၤအါထီၣ်ကညီလံာ်ခီယ့ၣ်။" : "Add to the living dictionary."}</h2></div>
      <div className="form-grid">
        <Input name="word" label={lang === "karen" ? "ကညီတၢ်ကတိၤ" : "Karen word or phrase"} lang="ksw" required />
        <Input name="translation" label={lang === "karen" ? "အဲကလံးတၢ်ကွဲးကျိာ်ထံ" : "English translation"} required />
        <Select name="type" label={lang === "karen" ? "တၢ်ဆှၢလီၤအကလုာ်" : "Contribution type"} required>
          <option value="definition">Definition</option><option value="translation">Translation variant</option><option value="example">Example sentence</option><option value="correction">Correction</option>
        </Select>
        <Select name="dialect" label={lang === "karen" ? "ကျိာ်အကလုာ်" : "Dialect"} required><option value="sgaw">S&apos;gaw Karen</option><option value="unsure">Not sure</option></Select>
      </div>
      <Textarea name="definition" label={lang === "karen" ? "တၢ်ပာ်ဖျါ" : "Definition or context"} rows={5} required hint="Tell reviewers when and how this term is used." />
      <div className="checkbox-row"><input id="source-confirm" name="rightsConfirmed" type="checkbox" value="yes" required /><label htmlFor="source-confirm">I created this contribution or have permission to share it under KOA&apos;s community language license.</label></div>
    </AsyncForm>
  );
}
