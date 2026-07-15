import {
  getDemoCoreConfig
} from "./chunk-N5PTHBXL.js";

// demo-core/knowledge.ts
function countCharacters(text) {
  return [...text].length;
}
function estimateTokens(text) {
  let cjk = 0;
  let other = 0;
  for (const ch of text) {
    if (/[\u3000-\u9fff\uF900-\uFAFF]/.test(ch)) cjk += 1;
    else other += 1;
  }
  return Math.ceil(cjk * 1.5 + other / 4);
}
function evaluateKnowledge(text) {
  const { warningFrom, hardLimit } = getDemoCoreConfig().knowledgePolicy;
  const characters = countCharacters(text);
  const estimatedTokens = estimateTokens(text);
  const withinHardLimit = characters <= hardLimit;
  const showWarning = characters >= warningFrom && withinHardLimit;
  let message;
  if (!withinHardLimit) {
    message = `\u73FE\u5728\u306E\u7C21\u6613\u30CA\u30EC\u30C3\u30B8\u30E2\u30FC\u30C9\u3067\u306F${hardLimit.toLocaleString()}\u6587\u5B57\u307E\u3067\u5165\u529B\u3067\u304D\u307E\u3059\u3002\u5185\u5BB9\u3092\u77ED\u304F\u3059\u308B\u304B\u3001\u672C\u756A\u5411\u3051\u306E\u6587\u66F8\u691C\u7D22\u69CB\u6210\u3092\u3054\u76F8\u8AC7\u304F\u3060\u3055\u3044\u3002`;
  } else if (showWarning) {
    message = "\u30CA\u30EC\u30C3\u30B8\u91CF\u304C\u591A\u304F\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u56DE\u7B54\u901F\u5EA6\u30FB\u5229\u7528\u30B3\u30B9\u30C8\u30FB\u56DE\u7B54\u7CBE\u5EA6\u306B\u5F71\u97FF\u3059\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002";
  }
  return {
    characters,
    estimatedTokens,
    withinHardLimit,
    showWarning,
    message
  };
}

export {
  countCharacters,
  estimateTokens,
  evaluateKnowledge
};
//# sourceMappingURL=chunk-SGG2CYMI.js.map