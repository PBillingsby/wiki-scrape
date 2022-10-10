import { fromHtml } from "hast-util-from-html"
import { toHtml } from "hast-util-to-html"
import { map } from 'unist-util-map'
import { h } from 'hastscript'

export const parseHTML = (content, title) => {
  const tree = fromHtml(content)
  const newTree = map(tree, node => {
    if (node.type === 'element' && node.tagName === 'head') {
      node.children =
        [
          h('link', { rel: 'stylesheet', href: 'https://arweave.net/ppG7r_LcsbQqyKaXUJp-VyNTStJciSibhxfRT73hT2I' }),
          h('title', title),
          h('meta', { charset: 'UTF-8' }),
          h('meta', { name: "description", content: `${title} Permaweb Page` })
        ]
    }
    if (node.type === 'element' && ['a', 'img'].includes(node.tagName)) {
      if (node?.properties?.href && node?.properties?.href.match("\^/wiki{0,}")) {
        node.properties.href = "https://wikipedia.org" + node.properties.href;
      }
    }

    return node
  })

  return toHtml(newTree)
}