import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const host = "127.0.0.1";
const displayHost = "localhost";
const startPort = Number(process.env.PORT || 3001);
const root = process.cwd();
let currentPort = startPort;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${host}`);
    const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(root, safePath);
    const data = await readFile(filePath);
    const contentType = contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";

    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentType
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

function listen(port) {
  currentPort = port;
  server.listen(port, host, () => {
    console.log(`Local: http://${displayHost}:${port}/`);
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const nextPort = currentPort + 1;

    console.log(`Port ${nextPort - 1} is busy, trying ${nextPort}...`);
    listen(nextPort);
    return;
  }

  throw error;
});

listen(startPort);
