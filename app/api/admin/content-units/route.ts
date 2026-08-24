import { enumField, handleApi, jsonOk, numberField, readJson, textField } from "@/lib/api";
import { requireAnyRole } from "@/lib/auth";
import { createEnglishRevision, listLanguageStudioUnits } from "@/lib/translation-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["admin"]);
    const units = await listLanguageStudioUnits();
    return jsonOk({ units });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request);
    enumField(body.sourceLocale ?? "en", "sourceLocale", ["en"] as const);
    const unit = await createEnglishRevision({
      route: textField(body.route, "route", { required: true, max: 180 })!,
      section: textField(body.section, "section", { required: true, max: 120 })!,
      frame: textField(body.frame, "frame", { required: true, max: 120 })!,
      sourceText: textField(body.sourceText, "sourceText", { required: true, max: 12_000 })!,
      provenanceNote: textField(body.provenanceNote, "provenanceNote", { max: 1_000 }),
      baseRevision: numberField(body.baseRevision ?? 0, "baseRevision", 0, 1_000_000),
      actorId: user.id,
    });
    return jsonOk({ unit }, { status: 201 });
  });
}
