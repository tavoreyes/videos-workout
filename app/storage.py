# Eliminar seguimiento de ejercicio
def eliminar_seguimiento(fecha, video_id):
    import pandas as pd
    if not os.path.exists(SEGUIMIENTO_PATH):
        return False
    df = pd.read_csv(SEGUIMIENTO_PATH)
    original_len = len(df)
    df = df[~((df["fecha"] == fecha) & (df["video_id"] == video_id))]
    df.to_csv(SEGUIMIENTO_PATH, index=False)
    return len(df) < original_len
import json
import pandas as pd
import os

CATEGORIAS_PATH = os.path.join(os.path.dirname(__file__), "categorias.json")
VIDEOS_PATH = os.path.join(os.path.dirname(__file__), "videos.csv")
SEGUIMIENTO_PATH = os.path.join(os.path.dirname(__file__), "seguimiento.csv")
# Guardar seguimiento de ejercicio
def guardar_seguimiento(fecha, video):
    registro = {
        "fecha": fecha,
        "video_id": video["id"],
        "url": video["url"],
        "titulo": video["titulo"],
        "categorias": video["categorias"]
    }
    df = pd.DataFrame([registro])
    if not os.path.exists(SEGUIMIENTO_PATH):
        df.to_csv(SEGUIMIENTO_PATH, index=False)
    else:
        df.to_csv(SEGUIMIENTO_PATH, mode="a", header=False, index=False)

# Cargar seguimientos
def cargar_seguimientos():
    if not os.path.exists(SEGUIMIENTO_PATH):
        return []
    df = pd.read_csv(SEGUIMIENTO_PATH)
    df = df.replace({pd.NA: "", float('nan'): "", None: ""})
    df = df.fillna("")
    return df.to_dict(orient="records")

# Cargar categorías
def cargar_categorias():
    with open(CATEGORIAS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def agregar_categoria(cat):
    categorias = cargar_categorias()
    if cat not in categorias:
        categorias.append(cat)
        with open(CATEGORIAS_PATH, "w", encoding="utf-8") as f:
            json.dump(categorias, f, ensure_ascii=False, indent=2)

def existe_video_url(url):
    if not os.path.exists(VIDEOS_PATH):
        return False
    df = pd.read_csv(VIDEOS_PATH)
    return url in df["url"].values

def guardar_video(registro):
    df = pd.DataFrame([registro])
    if not os.path.exists(VIDEOS_PATH):
        df.to_csv(VIDEOS_PATH, index=False)
    else:
        df.to_csv(VIDEOS_PATH, mode="a", header=False, index=False)

def cargar_videos():
    if not os.path.exists(VIDEOS_PATH):
        return []
    df = pd.read_csv(VIDEOS_PATH)
    df = df.replace({pd.NA: "", float('nan'): "", None: ""})
    df = df.fillna("")
    df["id"] = df.index
    return df.to_dict(orient="records")

def editar_video(id, titulo, descripcion, categorias):
    if not os.path.exists(VIDEOS_PATH):
        return None
    df = pd.read_csv(VIDEOS_PATH)
    if id < 0 or id >= len(df):
        return None
    df.at[id, "titulo"] = titulo
    df.at[id, "descripcion"] = descripcion
    df.at[id, "categorias"] = ",".join(categorias)
    df.to_csv(VIDEOS_PATH, index=False)
    registro = df.iloc[id].to_dict()
    registro["id"] = id
    return registro
