import fs from 'fs';
import wiki from 'wikijs';
import Bundlr from '@bundlr-network/client';
import { WarpFactory } from 'warp-contracts'
import open from 'open';
import { parseHTML } from './utils/parse.js'
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());

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
    const html = parseHTML(await content.html(), content.title);


    prepareNft(html, content)
  }
  catch (err) {
    console.error(err)
  }
}

const prepareNft = async (page, content) => {
  const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);
  const tags = [
    { name: "Application", value: "WikiTestArchiver1" },
    { name: "Page-ID", value: `${content.pageid ?? "unknown"}` },
    { name: "Page-Title", value: content.title },
    { name: "Content-Type", value: "text/html" }
  ];
  const tx = bundlr.createTransaction(page, { tags: tags })

  try {
    await tx.sign();
    const res = await tx.upload();

    createNFT(res.data.id, content);
  } catch (err) {
    console.log(err.message)
  }
}

const createNFT = async (id, content) => {
  const initState = {
    "title": `${content.title} Artefact`,
    "name": `Artefact #${content.pageid}`,
    "description": `Minted from archiving pool yxq8iG5KJYsgVaIzZU8c1JvKmuCFFayexREmGax2h6c`,
    "ticker": "KOINFT",
    "balances": {},
    // "owner": tokenHolder,
    "maxSupply": 1, // used to allow fractional shares without stepping into decimal territory
    "contentType": "application/json",
    "transferable": false,
    "lockTime": 0,
    "lastTransferTimestamp": null,
    "createdAt": new Date().getTime()
  }

  let tags = [
    { name: "Application", value: "WikipediaScraperTest1" },
    { name: "Page-Id", value: `${content.pageid ?? "unknown"}` },
    { name: "Page-Title", value: content.title },
    { name: "Type", value: "manifest" }
  ];

  tags.push({ name: "Action", value: "marketplace/Create" });
  tags.push({ name: "Network", value: "Koi" });
  tags.push({ name: "Artefact-Series", value: "Wikipedia Pool" })
  tags.push({ name: "Pool-Id", value: "yxq8iG5KJYsgVaIzZU8c1JvKmuCFFayexREmGax2h6c" })

  const warp = WarpFactory.forMainnet();

  // NFT CONTRACT ID: Qa7IR-xvPkBtcYUBZXd8z-Tu611VeJH33uEA5XiFUNA

  const manifest = {
    manifest: "arweave/paths",
    version: "0.1.0",
    index: { path: "index.html" },
    paths: { "index.html": { id: id } }
  }

  const tx = await warp.createContract.deployFromSourceTx({
    srcTxId: "gj8YXEbmONb_-q4bX28AhcO4POT39JwhLKez-YKV89k",
    wallet: jwk,
    initState: JSON.stringify(initState),
    data: { "Content-Type": "application/x.arweave-manifest+json", body: JSON.stringify(manifest) },
    tags
  }, true)

  console.log(tx)
  await open(`https://arweave.net/${id}`)

}

scrapePage(process.argv[2])