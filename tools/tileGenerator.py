from io import BytesIO
from json import loads
from math import ceil, log2
from multiprocessing import Pool
from os import makedirs, mkdir, path
from time import time
from PIL import Image
from cairosvg import svg2png


def saveCropped(parameters):
    x, y, zoom, tileSize, scaled, dirName = parameters

    tile = scaled.crop([tileSize * x, tileSize * y, tileSize * (x + 1), tileSize * (y + 1)])
    tile.save(path.join(dirName, f'{y}.webp'), lossless=True, quality=100)


def process(task: dict):
    width = task.get('width', 1)
    height = task.get('height', 1)
    tileSize = task.get('tileSize', 1)
    file = task.get('source', 'undefined.png')
    outDir = task.get('outDir', 'undefined')

    name, ext = path.splitext(file)

    if not path.isdir(outDir):
        makedirs(outDir)

    maxZoom = log2(max(width, height) / tileSize)
    optimalZoom = ceil(maxZoom)

    print(f'File: {name}{ext}, optimal zoom: {ceil(optimalZoom)} ({maxZoom}), size: {2 ** (log2(tileSize) + optimalZoom)}')

    canvas = Image.new('RGBA', [int(2 ** (log2(tileSize) + optimalZoom)), int(2 ** (log2(tileSize) + optimalZoom))])

    if ext == '.svg':
        svg = svg2png(url=file, output_width=width, output_height=height)
        canvas.paste(Image.open(BytesIO(svg)))
    else:
        img = Image.open(file)
        canvas.paste(img)

    croppedArgs = []

    for zoom in range(optimalZoom + 1):
        scaledCanvasSize = 2 ** (log2(tileSize) + zoom)
        tilesPerSide = 2 ** zoom
        scale = 2 ** (optimalZoom - zoom)
        scaledWidth = width / scale
        scaledHeight = height / scale

        scaled = canvas.resize([int(scaledCanvasSize), int(scaledCanvasSize)], Image.Resampling.LANCZOS)

        lvl1 = path.join(outDir, str(zoom))
        if not path.isdir(lvl1):
            mkdir(lvl1)

        for x in range(tilesPerSide):
            if tileSize * x > scaledWidth:
                break

            lvl2 = path.join(lvl1, str(x))
            if not path.isdir(lvl2):
                mkdir(lvl2)

            for y in range(tilesPerSide):
                if tileSize * y > scaledHeight:
                    break

                croppedArgs.append((x, y, zoom, tileSize, scaled, lvl2))

    with Pool() as p:
        p.map(saveCropped, croppedArgs)


def main():
    Image.MAX_IMAGE_PIXELS = None  # override dos protection

    with open('resources/tiles.manifest.json', encoding='utf-8') as manifest:
        j: dict = loads(manifest.read())

    for task in j.get('tasks', []):
        process(task)


if __name__ == '__main__':
    t1 = time()

    main()

    t2 = time()
    print(f'Processing time: {t2 - t1}')
