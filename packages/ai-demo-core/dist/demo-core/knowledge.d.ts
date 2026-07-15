declare function countCharacters(text: string): number;
/** Rough estimate; prefer honesty over precision. Japanese-heavy heuristic. */
declare function estimateTokens(text: string): number;
type KnowledgeStatus = {
    characters: number;
    estimatedTokens: number;
    withinHardLimit: boolean;
    showWarning: boolean;
    message?: string;
};
declare function evaluateKnowledge(text: string): KnowledgeStatus;

export { type KnowledgeStatus, countCharacters, estimateTokens, evaluateKnowledge };
