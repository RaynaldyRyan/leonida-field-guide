/* Leonida Field Guide — tiny static server for app/ on 127.0.0.1:8080.
   Node 22, standard library only. Serves only files inside app/. */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const APP_DIR = resolve(process.cwd(), "app");
const PORT = Number(process.env.PORT || 8080);
const HOST = "127.0.0.1";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function serveStaticFile(filePath: string, res: any): void {
  const type = MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = resolve(join(APP_DIR, normalize(requested)));
  if (!filePath.startsWith(APP_DIR + "/") && filePath !== APP_DIR) {
    res.writeHead(403, { "content-type": "text/plain" });
    res.end("Forbidden: path outside app/");
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
    return;
  }
  serveStaticFile(filePath, res);
});

server.listen(PORT, HOST, () => {
  console.log("Leonida Field Guide serving app/ at http://" + HOST + ":" + PORT + "/");
});
