const express = require("express");
const corsAnywhere = require("cors-anywhere");
const JSZip = require("jszip");
const app = express();
const fetch = require("node-fetch");
const fr = require("follow-redirects");
const url = require("url");
const cors = require("cors");
const srt2vvt = require("./srt2vvt");
const path = require("path");

let proxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers.
  removeHeaders: [], // Do not remove any headers.
});

app.use("*", (req, res, next) => {
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.body));
  next();
});
app.use(
  cors({
    allowedHeaders: "Content-Type, Accept, x-requested-with",
    methods: "POST, GET, OPTIONS",
    maxAge: "1728000",
    origin: "*",
  })
);
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/redirect/:redirectUrl*", (req, res) => {
  req.url = req.url.replace("/redirect/", "");
  const prot = url.parse(req.url).protocol.slice(0, -1);
  if (prot !== "http" && prot !== "https") return res.sendStatus(400);
  fr[prot]
    .get(req.url, (resp) => {
      res.send(resp.responseUrl);
    })
    .on("error", (err) => {
      res.status(500).json({ err });
    });
});

app.post("/zip-file", async (req, res) => {
  try {
    const { url, fileKey, encoding = "utf8" } = req.body;
    const buffer = await fetch(url)
      .then((res) => res.arrayBuffer())
      .catch((err) => {
        res.status(400).json({ err });
      });
    const zip = await JSZip.loadAsync(buffer).catch((err) => {
      res.status(400).json({ err });
    });
    const srtBuffer = await zip.files[fileKey].async("arraybuffer");
    const decoder = new TextDecoder(encoding);
    const decoded = decoder.decode(srtBuffer);
    const vvt = srt2vvt(decoded);
    return res.status(200).send(vvt);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/zip-list", async (req, res) => {
  try {
    const { url } = req.body;
    const buffer = await fetch(url)
      .then((res) => res.arrayBuffer())
      .catch((err) => {
        res.status(400).json({ err });
      });
    const zip = await JSZip.loadAsync(buffer).catch((err) => {
      res.status(400).json({ err });
    });
    const srtList = Object.keys(zip.files).filter((v) => v.endsWith(".srt"));
    return res.status(200).json({ files: srtList });
  } catch (error) {
    console.log(error);
  }
});

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get("/proxy/:proxyUrl*", (req, res) => {
  req.url = req.url.replace("/proxy/", "/"); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  proxy.emit("request", req, res);
  console.log("proxy hit");
});
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(3000, () => console.log(`Listenning on port 3000`));
