const fs = require('fs');
const wiki = require('wikijs').default;
const Bundlr = require('@bundlr-network/client');
const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
const open = require('open')
const prompt = require("prompt-sync")({ sigint: true });

const cleaup = ['src-id.txt', 'src-manifest.csv', 'src-manifest.json', 'src/index.html'];

const scrapePage = async (query) => {
  let content
  try {
    await wiki({ apiUrl: 'https://wikipedia.org/w/api.php' })
      .page(query)
      .then(page => page)
      .then(obj => content = obj)

    const confirm = prompt(`Do you wish to upload the following? Y/N \n ${content.fullurl} \n`);

    if (confirm.toLowerCase() === "y") {
      const page = `<link rel="stylesheet" href="style.css"> ` + await content.html()

      const tags = [
        { name: "Application", value: "ArWiki" },
        { name: "Page-ID", value: `${content.pageid ?? "unknown"}` },
        { name: "Content-Type", value: "application/json" }
      ];

      page.replaceAll(`href="/wiki/`, `href="wikipedia.org/wiki/"`)

      fs.writeFile('./src/index.html', page, err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
      console.log(content)
      createTransaction(tags)
    }
  }
  catch (err) {
    console.error(err)
  }
}

const createTransaction = async (tags) => {
  const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);
  const tx = await bundlr.uploader.uploadFolder("./src", "index.html", { tags });

  await open(`https://arweave.net/${tx}`)

  if (tx) {
    cleaup.forEach(file => {
      fs.unlink(file, function (err) {
        if (err) throw err;
      })
    })
  }
}

scrapePage(process.argv[2])