export function AIFieldIndicator({ confidence }: { confidence?: number }) {
  if (confidence === undefined) return null
  if (confidence <= 0) return <span className="field-source is-missing">Not in the document</span>
  return <span className="field-source">From the document · {Math.round(confidence * 100)}%</span>
}
