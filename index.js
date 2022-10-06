import fs from 'fs';
import wiki from 'wikijs';
import Bundlr from '@bundlr-network/client';
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
import open from 'open';
import { parseHTML } from './utils/parse.js'

const CLEANUP = ['src-id.txt', 'src-manifest.csv', 'src-manifest.json'];

const getPage = async (query) => {
  let content

  await wiki.default({ apiUrl: 'https://wikipedia.org/w/api.php' })
    .page(query)
    .then(page => page)
    .then(obj => content = obj)

  return content
}

const scrapePage = async (query) => {
  try {
    const content = await getPage(query)

    const tags = [
      { name: "Application", value: "WikipediaArchiveTest" },
      { name: "Page-ID", value: `${content.pageid ?? "unknown"}` },
      { name: "Page-Title", value: content.title },
      { name: "Content-Type", value: "text/html" }
    ];

    const html = parseHTML(await content.html());

    // don't need this any more
    //let page = `<link rel="stylesheet" href="https://arweave.net/ppG7r_LcsbQqyKaXUJp-VyNTStJciSibhxfRT73hT2I">` + html
    createTransaction(page, tags)
    // close the program
  }
  catch (err) {
    console.error(err)
  }
}

const createTransaction = async (page, tags) => {
  const bundlr = new Bundlr.default("http://node2.bundlr.network", "arweave", jwk);
  const tx = bundlr.createTransaction(page, { tags: tags })

  await tx.sign();

  const res = await tx.upload();
  await open(`https://arweave.net/${res.data.id}`)

  if (tx) {
    CLEANUP.forEach(file => {
      fs.unlink(file, function (err) {
        if (err) throw err;
      })
    })
  }
}

scrapePage(process.argv[2])