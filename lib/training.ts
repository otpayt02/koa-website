export const MINIMUM_STT_SECONDS = 100 * 60 * 60;

export function datasetReadiness(input: { approvedItems: number; validatedSeconds: number }) {
  return {
    ...input,
    minimumSttSeconds: MINIMUM_STT_SECONDS,
    readyForInitialSttTraining: input.validatedSeconds >= MINIMUM_STT_SECONDS,
    remainingSeconds: Math.max(0, MINIMUM_STT_SECONDS - input.validatedSeconds),
    note: "KOA currently prepares and exports reviewed datasets only. No model is trained unless a real training provider and explicit run workflow are configured.",
  };
}
