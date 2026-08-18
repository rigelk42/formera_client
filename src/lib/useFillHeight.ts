import { useEffect, useRef, useState } from 'react'

/** Measures the space available for an Ant Design Table's scroll.y within
 * a flex-grown wrapper, via ResizeObserver, so the table fills exactly
 * however much space is actually available -- rather than a guessed fixed
 * pixel value that's wrong on any page/viewport combination it wasn't
 * tuned for.
 *
 * scroll.y only caps the height of .ant-table-body -- when it's set, Ant
 * Design renders a separate fixed .ant-table-header row above that body,
 * so passing the wrapper's full height straight through as scroll.y makes
 * the real total (header + body) taller than the wrapper by the header's
 * own height. Subtracting the rendered header height keeps the whole
 * table within the wrapper's bounds. */
export function useFillHeight(fallback: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(fallback)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const header = node.querySelector<HTMLElement>('.ant-table-thead')
      const headerHeight = header?.offsetHeight ?? 0
      setHeight(Math.max(entry.contentRect.height - headerHeight, 0))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, height] as const
}
