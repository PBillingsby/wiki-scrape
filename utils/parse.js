import { fromHtml } from "hast-util-from-html"
import { toHtml } from "hast-util-to-html"
// import findAndReplace from 'hast-util-find-and-replace'
import { map } from 'unist-util-map'

export const parseHTML = (content) => {
  const tree = fromHtml(content)
  const newTree = map(tree, node => {
    if (node.type === 'element' && node.tagName === 'a') {
      if (node?.properties?.href && node?.properties?.href.match("\^/wiki{0,}")) {
        // node?.properties?.href = "https://wikipedia.org" + node?.properties.href;
      }
      return node
    }
    if (node.type === 'element' && node.tagName === 'img') {
      if (node?.properties?.href && node?.properties?.href.match("\^/wiki{0,}")) {
        // node?.properties?.href = "https://wikipedia.org" + node?.properties.href;
      }
      return node
    }
    return node
  })

  return toHtml(newTree)
  // const xhtml = toHtml(tree)
  // save new html as an html file
  // console.log(xhtml)
}