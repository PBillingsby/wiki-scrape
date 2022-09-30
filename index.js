const fs = require('fs');
const wiki = require('wikijs').default;
const Bundlr = require('@bundlr-network/client');
const Arweave = require('arweave');
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());


const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
})
const scrapePage = async (query) => {
  let content
  try {
    await wiki({ apiUrl: 'https://wikipedia.org/w/api.php' })
      .page(query)
      .then(page => page)
      .then(obj => content = obj)


    const page = `<link rel="stylesheet" href="style.css"> ` + await content.html().then(p => p.replace("//upload", "https://upload"))

    fs.writeFile('./src/index.html', page, err => {
      if (err) {
        console.error(err);
      }
      // file written successfully
    });

    createTransaction()
  }
  catch (err) {
    console.error(err)
  }
}

const createTransaction = async () => {
  const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);
  const tx = await bundlr.uploader.uploadFolder("./src", "./index.html");
  console.log(tx)
}

scrapePage('Andrea Nagy')