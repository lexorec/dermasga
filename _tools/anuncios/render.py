#!/usr/bin/env python3
"""Renderiza un anuncio en video (MP4 + portada JPG) por red social con Chrome sin ventana y ffmpeg.

Uso, desde la carpeta del repositorio:
  python3 _tools/anuncios/render.py pediatria                        # videos y portadas -> assets/video/
  python3 _tools/anuncios/render.py pediatria --formatos tiktok      # solo una red
  python3 _tools/anuncios/render.py pediatria --portadas             # solo las portadas
  python3 _tools/anuncios/render.py pediatria --cuadros 1,6.5,15 --salida /tmp/prueba   # imágenes sueltas para revisar
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
FPS = 30


class Job:
    """What to render, plus the ffmpeg encoders fed by the page."""

    def __init__(self, ad, tasks):
        self.ad, self.tasks = ad, tasks
        self.encoders = {}
        self.done = threading.Event()
        self.error = None

    def frame(self, i, n, total, data):
        task = self.tasks[i]
        if i not in self.encoders:
            self.encoders[i] = subprocess.Popen(
                ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "png", "-framerate", str(FPS), "-i", "-",
                 "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", task["out"]],
                stdin=subprocess.PIPE)
        self.encoders[i].stdin.write(data)
        if n % FPS == 0 or n == total - 1:
            print(f"\r  {task['format']}: cuadro {n + 1} de {total}", end="", flush=True)

    def end(self, i):
        enc = self.encoders.pop(i)
        enc.stdin.close()
        if enc.wait() != 0:
            raise RuntimeError("ffmpeg falló con " + self.tasks[i]["out"])
        print("\n  listo: " + os.path.relpath(self.tasks[i]["out"], ROOT))

    def image(self, i, data):
        with open(self.tasks[i]["out"], "wb") as f:
            f.write(data)
        print("  listo: " + os.path.relpath(self.tasks[i]["out"], ROOT))


def handler_for(job):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=ROOT, **kwargs)

        def log_message(self, *args):
            pass

        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

        def do_GET(self):
            if self.path != "/plan":
                return super().do_GET()
            plan = {"ad": job.ad, "fps": FPS, "tasks": [{k: v for k, v in t.items() if k != "out"} for t in job.tasks]}
            body = json.dumps(plan).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_POST(self):
            url = urlparse(self.path)
            q = {k: v[0] for k, v in parse_qs(url.query).items()}
            data = self.rfile.read(int(self.headers.get("Content-Length") or 0))
            try:
                if url.path == "/frame":
                    job.frame(int(q["task"]), int(q["n"]), int(q["of"]), data)
                elif url.path == "/end":
                    job.end(int(q["task"]))
                elif url.path == "/image":
                    job.image(int(q["task"]), data)
                elif url.path == "/finished":
                    job.done.set()
                elif url.path == "/error":
                    job.error = data.decode("utf-8", "replace")
                    job.done.set()
            except Exception as err:  # report it and stop instead of leaving the page waiting
                job.error = repr(err)
                job.done.set()
            self.send_response(204)
            self.end_headers()

    return Handler


def main():
    ap = argparse.ArgumentParser(description="Renderiza un anuncio de _tools/anuncios/ en MP4 y portadas.")
    ap.add_argument("anuncio", help="nombre del archivo del anuncio en esta carpeta, sin .js (p. ej. pediatria)")
    ap.add_argument("--formatos", default="instagram,tiktok,facebook", help="redes separadas por comas")
    ap.add_argument("--portadas", action="store_true", help="solo las portadas")
    ap.add_argument("--cuadros", help="solo imágenes PNG en estos segundos, separados por comas")
    ap.add_argument("--salida", default=os.path.join(ROOT, "assets", "video"), help="carpeta de salida")
    args = ap.parse_args()
    if not os.path.exists(os.path.join(HERE, args.anuncio + ".js")):
        sys.exit(f"No existe _tools/anuncios/{args.anuncio}.js")
    os.makedirs(args.salida, exist_ok=True)

    tasks = []
    for fmt in args.formatos.split(","):
        base = os.path.join(args.salida, f"anuncio-{args.anuncio}-{fmt}")
        if args.cuadros:
            for t in args.cuadros.split(","):
                tasks.append({"kind": "still", "format": fmt, "t": float(t), "out": f"{base}-{float(t):05.2f}s.png"})
            continue
        if not args.portadas:
            tasks.append({"kind": "video", "format": fmt, "out": base + ".mp4"})
        tasks.append({"kind": "cover", "format": fmt, "out": base + "-portada.jpg"})

    job = Job(args.anuncio, tasks)
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler_for(job))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    page = f"http://127.0.0.1:{server.server_port}/{os.path.relpath(HERE, ROOT)}/render.html"
    profile = tempfile.mkdtemp(prefix="anuncio-chrome-")
    chrome = subprocess.Popen(
        [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--mute-audio",
         "--hide-scrollbars", f"--user-data-dir={profile}", page],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not job.done.wait(timeout=3600):
            job.error = "tiempo agotado"
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=10)
        except subprocess.TimeoutExpired:
            chrome.kill()
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)
        for enc in job.encoders.values():
            enc.kill()
    if job.error:
        sys.exit("\nError: " + job.error)


if __name__ == "__main__":
    main()
