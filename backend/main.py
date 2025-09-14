from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from diffusers import StableDiffusionInpaintPipeline
import torch, io, os
from PIL import Image
from rembg import remove
import uvicorn

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16 if device == "cuda" else torch.float32
).to(device)

@app.post("/tryon")
async def tryon(person_image: UploadFile = File(...), product_image: UploadFile = File(...)):
    person = Image.open(io.BytesIO(await person_image.read())).convert("RGB")
    cloth = Image.open(io.BytesIO(await product_image.read())).convert("RGB")

    # background remove (optional)
    person = remove(person)

    prompt = "A person wearing the uploaded product dress"
    result = pipe(
        prompt=prompt,
        image=person,
        mask_image=cloth,   # simulate overlay
        strength=0.7,
        guidance_scale=7.5,
    ).images[0]

    out_path = "output.png"
    result.save(out_path)
    return FileResponse(out_path, media_type="image/png")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
