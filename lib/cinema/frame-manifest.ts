export const CINEMATIC_LOCALES = ["en", "th", "my", "ksw"] as const;

export type CinematicLocale = (typeof CINEMATIC_LOCALES)[number];

export type FrameTunable = {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  referenceWeight: number;
  description: string;
};

export type CinematicFrame = {
  id: string;
  title: string;
  route: "/[lang]";
  entry: { progress: number };
  exit: { progress: number };
  foreground: string[];
  background: string[];
  staticFeatures: string[];
  motionFeatures: string[];
  tunables: Record<string, FrameTunable>;
  locales: CinematicLocale[];
  motionOff: { summary: string; result: string[] };
  why: string;
  evidence: string[];
};

export type FrameManifestLoadResult =
  | { ok: true; cookbook: string; frames: CinematicFrame[] }
  | { ok: false; cookbook: string; frames: []; errors: string[] };

export function loadFrameManifest(input: unknown): FrameManifestLoadResult {
  const errors: string[] = [];
  if (!isRecord(input)) return invalid(["Manifest must be an object."], "");

  const cookbook = text(input.cookbook);
  if (!cookbook) errors.push("Manifest cookbook reference is required.");
  if (!Array.isArray(input.frames)) return invalid([...errors, "Manifest frames must be an array."], cookbook);

  const frames: CinematicFrame[] = [];
  const ids = new Set<string>();
  let previousExit = 0;

  input.frames.forEach((candidate, index) => {
    const label = `Frame ${index + 1}`;
    if (!isRecord(candidate)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    const id = text(candidate.id);
    if (!id) errors.push(`${label} id is required.`);
    else if (ids.has(id)) errors.push(`${label} id ${id} is duplicated.`);
    else ids.add(id);

    const title = text(candidate.title);
    if (!title) errors.push(`${label} title is required.`);
    if (candidate.route !== "/[lang]") errors.push(`${label} route must be /[lang].`);

    const entry = progressValue(candidate.entry);
    const exit = progressValue(candidate.exit);
    if (entry === null || exit === null) errors.push(`${label} entry and exit progress must be finite numbers from 0 to 1.`);
    if (entry !== null && exit !== null) {
      if (exit <= entry) errors.push(`${label} exit progress must be greater than entry progress.`);
      if (index > 0 && entry < previousExit) errors.push(`${label} overlaps the previous progress range.`);
      previousExit = exit;
    }

    const foreground = stringArray(candidate.foreground, `${label} foreground`, errors);
    const background = stringArray(candidate.background, `${label} background`, errors);
    const staticFeatures = stringArray(candidate.staticFeatures, `${label} staticFeatures`, errors);
    const motionFeatures = stringArray(candidate.motionFeatures, `${label} motionFeatures`, errors);
    const evidence = stringArray(candidate.evidence, `${label} evidence`, errors);

    const locales = stringArray(candidate.locales, `${label} locales`, errors);
    if (JSON.stringify(locales) !== JSON.stringify(CINEMATIC_LOCALES)) {
      errors.push(`${label} locales must be en, th, my, and ksw in canonical order.`);
    }

    const tunables = parseTunables(candidate.tunables, label, errors);
    const motionOff = parseMotionOff(candidate.motionOff, label, errors);
    const why = text(candidate.why);
    if (!why) errors.push(`${label} why is required.`);

    if (id && title && entry !== null && exit !== null && motionOff) {
      frames.push({
        id,
        title,
        route: "/[lang]",
        entry: { progress: entry },
        exit: { progress: exit },
        foreground,
        background,
        staticFeatures,
        motionFeatures,
        tunables,
        locales: locales as CinematicLocale[],
        motionOff,
        why,
        evidence,
      });
    }
  });

  if (errors.length) return invalid(errors, cookbook);
  return { ok: true, cookbook, frames };
}

function parseTunables(value: unknown, label: string, errors: string[]) {
  const parsed: Record<string, FrameTunable> = {};
  if (!isRecord(value)) {
    errors.push(`${label} tunables must be an object.`);
    return parsed;
  }

  for (const [name, candidate] of Object.entries(value)) {
    if (!isRecord(candidate)) {
      errors.push(`${label} tunable ${name} must be an object.`);
      continue;
    }
    const tunable = {
      value: number(candidate.value),
      min: number(candidate.min),
      max: number(candidate.max),
      step: number(candidate.step),
      unit: text(candidate.unit),
      referenceWeight: number(candidate.referenceWeight),
      description: text(candidate.description),
    };
    if (!tunable.description) errors.push(`${label} tunable ${name} description is required.`);
    if (!tunable.unit) errors.push(`${label} tunable ${name} unit is required.`);
    if (![tunable.value, tunable.min, tunable.max, tunable.step, tunable.referenceWeight].every(Number.isFinite)) {
      errors.push(`${label} tunable ${name} values must be finite numbers.`);
      continue;
    }
    if (tunable.min > tunable.max || tunable.value < tunable.min || tunable.value > tunable.max) {
      errors.push(`${label} tunable ${name} value must stay inside its safe range.`);
    }
    if (tunable.referenceWeight < tunable.min || tunable.referenceWeight > tunable.max) {
      errors.push(`${label} tunable ${name} reference weight must stay inside its safe range.`);
    }
    if (tunable.step <= 0) errors.push(`${label} tunable ${name} step must be greater than zero.`);
    parsed[name] = tunable;
  }
  return parsed;
}

function parseMotionOff(value: unknown, label: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${label} Motion-off result is required.`);
    return null;
  }
  const summary = text(value.summary);
  const result = stringArray(value.result, `${label} Motion-off result`, errors);
  if (!summary) errors.push(`${label} Motion-off summary is required.`);
  if (!result.length) errors.push(`${label} Motion-off result must describe the settled composition.`);
  return summary && result.length ? { summary, result } : null;
}

function stringArray(value: unknown, label: string, errors: string[]) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push(`${label} must be an array of documented strings.`);
    return [];
  }
  return value as string[];
}

function progressValue(value: unknown) {
  if (!isRecord(value) || typeof value.progress !== "number" || !Number.isFinite(value.progress)) return null;
  return value.progress >= 0 && value.progress <= 1 ? value.progress : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown) {
  return typeof value === "number" ? value : Number.NaN;
}

function invalid(errors: string[], cookbook: string): FrameManifestLoadResult {
  return { ok: false, cookbook, frames: [], errors };
}
