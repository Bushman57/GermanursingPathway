export function parseLearningSearch(raw: Record<string, unknown>) {
  const learningReturn =
    typeof raw.learningReturn === "string" ? raw.learningReturn.trim() : "";
  const learningTopic =
    typeof raw.learningTopic === "string" ? raw.learningTopic.trim() : "";
  return {
    learningReturn: learningReturn || undefined,
    learningTopic: learningTopic || undefined,
  };
}
