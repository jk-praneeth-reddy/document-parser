interface Props {
  data: unknown
}

function highlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="text-indigo-600 font-medium">${match}</span>`
        return `<span class="text-emerald-600">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span class="text-amber-500">${match}</span>`
      if (/null/.test(match)) return `<span class="text-gray-400">${match}</span>`
      return `<span class="text-sky-600">${match}</span>`
    }
  )
}

export default function JsonViewer({ data }: Props) {
  const json = JSON.stringify(data, null, 2)
  const html = highlight(json)

  const copy = () => navigator.clipboard.writeText(json)

  return (
    <div className="relative group rounded-xl bg-gray-950 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-3 right-3 z-10 px-2.5 py-1 text-xs text-gray-400 bg-gray-800
          hover:bg-gray-700 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
      >
        Copy
      </button>
      <pre
        className="text-sm font-mono p-5 overflow-auto max-h-[500px] leading-relaxed text-gray-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
