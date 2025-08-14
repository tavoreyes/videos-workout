
from fastapi import FastAPI, Request, HTTPException, Body, Query
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.scraping import extraer_metadatos
from app.storage import (
    cargar_categorias, agregar_categoria, guardar_video, cargar_videos, editar_video, existe_video_url,
    guardar_seguimiento, cargar_seguimientos
)
from datetime import datetime
import os


app = FastAPI()
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

# Endpoint para eliminar seguimiento
from fastapi import Query
@app.delete("/eliminar_seguimiento")
def eliminar_seguimiento(fecha: str = Query(...), video_id: int = Query(...)):
    from app.storage import eliminar_seguimiento as eliminar_seguimiento_func
    ok = eliminar_seguimiento_func(fecha, video_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return {"ok": True}

# Endpoint para marcar seguimiento
@app.post("/marcar_seguimiento")
async def marcar_seguimiento(data: dict = Body(...)):
    video_id = data.get("video_id")
    fecha = data.get("fecha")
    if video_id is None or not fecha:
        raise HTTPException(status_code=400, detail="video_id y fecha requeridos")
    videos = cargar_videos()
    video = next((v for v in videos if v["id"] == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    guardar_seguimiento(fecha, video)
    return {"ok": True}

# Endpoint para consultar seguimientos
@app.get("/seguimientos")
def get_seguimientos():
    return cargar_seguimientos()

@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")

@app.post("/agregar_video")
async def agregar_video(request: Request):
    data = await request.json()
    url = data.get("url")
    categorias = data.get("categorias", [])
    nueva_categoria = data.get("nueva_categoria")
    if not url:
        raise HTTPException(status_code=400, detail="URL requerida")
    if existe_video_url(url):
        raise HTTPException(status_code=409, detail="Video ya registrado")
    if nueva_categoria:
        agregar_categoria(nueva_categoria)
        categorias.append(nueva_categoria)
    metadatos = extraer_metadatos(url)
    if not metadatos:
        raise HTTPException(status_code=404, detail="No se encontraron metadatos")
    fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    registro = {
        "fecha": fecha,
        "url": url,
        "titulo": metadatos["titulo"],
        "descripcion": metadatos["descripcion"],
        "miniatura_url": metadatos["miniatura_url"],
        "categorias": ",".join(categorias)
    }
    guardar_video(registro)
    return JSONResponse(content=registro)

@app.get("/categorias")
def get_categorias():
    return cargar_categorias()

@app.get("/videos")
def get_videos():
    return cargar_videos()

@app.put("/editar_video/{id}")
async def put_editar_video(id: int, request: Request):
    data = await request.json()
    titulo = data.get("titulo")
    descripcion = data.get("descripcion")
    categorias = data.get("categorias", [])
    resultado = editar_video(id, titulo, descripcion, categorias)
    if not resultado:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    return JSONResponse(content=resultado)
