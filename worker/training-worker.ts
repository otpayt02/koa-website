type TrainingWorkerEnv = { DB: D1Database; MEDIA: R2Bucket };

/**
 * Exports a reviewed dataset manifest for an external, explicitly configured
 * training system. This worker deliberately does not claim to train a model.
 */
export async function exportNextReviewedDataset(env: TrainingWorkerEnv): Promise<{ exported: boolean; runId?: string }> {
  const run = await env.DB.prepare("SELECT id, task_type, dataset_version FROM training_runs WHERE status = 'queued' ORDER BY created_at LIMIT 1").first<{ id: string; task_type: string; dataset_version: string }>();
  if (!run) return { exported: false };
  await env.DB.prepare("UPDATE training_runs SET status = 'running', status_message = ?, started_at = ?, updated_at = ? WHERE id = ? AND status = 'queued'")
    .bind("Preparing a consented, reviewed dataset manifest. No model training is performed here.", Date.now(), Date.now(), run.id).run();
  try {
    const result = await env.DB.prepare("SELECT id, storage_key, transcription, translation, language, dialect, duration_seconds, license_version FROM audio_pairs WHERE status = 'approved' AND quality = 'validated' AND consent_granted = 1 ORDER BY created_at").all();
    const key = `training-exports/${run.task_type}/${run.id}/manifest.json`;
    await env.MEDIA.put(key, JSON.stringify({ runId: run.id, taskType: run.task_type, datasetVersion: run.dataset_version, createdAt: new Date().toISOString(), items: result.results }), { httpMetadata: { contentType: "application/json" } });
    await env.DB.prepare("UPDATE training_runs SET status = 'exported', status_message = ?, completed_at = ?, updated_at = ? WHERE id = ?")
      .bind(`Reviewed dataset manifest exported to private object storage at ${key}. No model was trained.`, Date.now(), Date.now(), run.id).run();
    return { exported: true, runId: run.id };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1_000) : "Dataset export failed";
    await env.DB.prepare("UPDATE training_runs SET status = 'failed', status_message = ?, completed_at = ?, updated_at = ? WHERE id = ?").bind(message, Date.now(), Date.now(), run.id).run();
    throw error;
  }
}
