import fs from 'fs';
import wiki from 'wikijs';
import Bundlr from '@bundlr-network/client';
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
import open from 'open';
import { parseHTML } from './utils/parse.js'

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
  const bundlr = new Bundlr.default("http://node2.bundlr.network", "arweave", jwk);
  const tags = [
    { name: "Application", value: "WikiTestArchiver1" },
    { name: "Page-ID", value: `${content.pageid ?? "unknown"}` },
    { name: "Page-Title", value: content.title },
    { name: "Content-Type", value: "text/html" }
  ];
  const tx = bundlr.createTransaction(page, { tags: tags })
  try {
    // await tx.sign();
    // const res = await tx.upload();

    createNFT(tx.id, content);
    // await open(`https://arweave.net/${res.data.id}`)

    // if (tx) {
    //   fs.unlink('src/index.html', function (err) {
    //     if (err) throw err;
    //   })
    // }
  } catch (err) {
    console.log(err.message)
  }
}

const createNFT = async (tags, content) => {
  console.log(content)
  const initState = {
    "title": `${content.title} Artefact`,
    "name": `Artefact #${content.pageid}`,
    "description": `Minted from archiving pool PLACEHOLDER`,
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

  // console.log(tags);
  // console.log(initState);

  // NFT CONTRACT ID: Qa7IR-xvPkBtcYUBZXd8z-Tu611VeJH33uEA5XiFUNA

  // MANIFEST const manifest = {
  //   manifest: "arweave/paths",
  //   version: "0.1.0",
  //   index: {},
  //   paths: {}
  // }

  // returns tx id
  // create contract with path manifest (router document pointing to tx id)
  // returned contract id

  //manifest.paths["index.html"] = { id: TX ID }
  // manifest.index = { path: "index.html" }

  // const tx = await warp.createContract.deployFromSourceTx({
  //   srcTxId: NFTContractID,
  //   wallet,
  //   initState: JSON.stringify(initialState),
  //   data: { "Content-Type": "application/x.arweave-manifest+json", body: JSON.stringify(manifest) },
  //   tags
  // })
}

scrapePage(process.argv[2])