import { handleApi } from "@/lib/api";
import { requireAnyRole } from "@/lib/auth";
import { OLIVER_PORTRAIT_PROMPT } from "@/lib/oliver-portrait";

const REFERENCE_IMAGE_PATH = "/koa/assets/team/oliver-payton-college-headshot.jpg";
const OPENAI_IMAGES_EDIT_URL = "https://api.openai.com/v1/images/edits";

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string }>;
  error?: { message?: string };
};

export async function POST(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["admin"]);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
    }

    const referenceResponse = await fetch(new URL(REFERENCE_IMAGE_PATH, request.url));
    if (!referenceResponse.ok) {
      return Response.json({ error: "The approved reference headshot is unavailable." }, { status: 500 });
    }

    const form = new FormData();
    form.set("model", "gpt-image-2.5-sunburst");
    form.set("prompt", OLIVER_PORTRAIT_PROMPT);
    form.set("image", new File([await referenceResponse.blob()], "oliver-payton-reference.jpg", { type: "image/jpeg" }));
    form.set("size", "1024x1536");
    form.set("quality", "high");
    form.set("output_format", "jpeg");

    const imageResponse = await fetch(OPENAI_IMAGES_EDIT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const result = (await imageResponse.json()) as OpenAIImageResponse;
    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageResponse.ok || !imageBase64) {
      return Response.json(
        { error: result.error?.message ?? "The image service did not return a portrait." },
        { status: imageResponse.status || 502 },
      );
    }

    return Response.json({ image: `data:image/jpeg;base64,${imageBase64}` });
  });
}
