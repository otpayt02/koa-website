import { enumField, handleApi, jsonOk, numberField, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { requireAnyRole } from "@/lib/auth";
import {
  createTranslationProposal,
  reviewTransitions,
  transitionTranslationProposal,
} from "@/lib/translation-service";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request);
    const proposal = await createTranslationProposal({
      contentUnitId: textField(body.contentUnitId, "contentUnitId", { required: true, max: 100 })!,
      sourceRevision: numberField(body.sourceRevision, "sourceRevision", 1, 1_000_000),
      sourceLocale: enumField(body.sourceLocale ?? "en", "sourceLocale", ["en"] as const),
      sourceProposalId: body.sourceProposalId === undefined
        ? null
        : textField(body.sourceProposalId, "sourceProposalId", { required: true, max: 100 }),
      locale: enumField(body.locale, "locale", ["th", "my", "ksw"] as const),
      value: textField(body.value, "value", { required: true, max: 12_000 })!,
      provider: textField(body.provider, "provider", { required: true, max: 120 }),
      modelVersion: textField(body.modelVersion, "modelVersion", { required: true, max: 160 }),
      confidence: numberField(body.confidence, "confidence", 0, 1),
      status: enumField(body.status ?? "draft", "status", ["draft", "pending_review"] as const),
      actorId: user.id,
    });
    return jsonOk({ proposal }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request);
    const status = enumField(body.status, "status", reviewTransitions);
    const result = await transitionTranslationProposal({
      id: textField(body.id, "id", { required: true, max: 100 })!,
      status,
      reviewerId: user.id,
      reviewNote: textField(body.reviewNote, "reviewNote", { max: 2_000 }),
    });
    await audit(request, {
      actor: user,
      action: `translation_proposal.${status}`,
      entity: "translation_proposal",
      entityId: result.proposal.id,
      before: result.before,
      after: result.proposal,
    });
    return jsonOk({ proposal: result.proposal });
  });
}
