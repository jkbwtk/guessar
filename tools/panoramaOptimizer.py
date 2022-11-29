import os
from multiprocessing import Pool
from shutil import copyfile
import argparse
from tqdm import tqdm
from PIL import Image


def generatePath(levels: int, filename: str, outDir: str):
    n, e = os.path.splitext(filename)
    p = outDir

    for i in range(levels):
        p = os.path.join(p, n[i])

    return p


def resize(args):
    copy, resolution, fmt, quality, file, inpt, output = args

    name, ext = os.path.splitext(file)

    if copy:
        copyfile(os.path.join(inpt, file), os.path.join(output, file))
        return

    tile = Image.open(os.path.join(inpt, file))

    if resolution != 0:
        tile = tile.resize([resolution, resolution], Image.Resampling.LANCZOS)

    if fmt == 'webp':
        tile.save(os.path.join(output, f'{name}.webp'), lossless=False, quality=quality, method=6)
    elif fmt == 'png':
        tile.save(os.path.join(output, f'{name}.png'), optimize=True)


def main():
    parser = argparse.ArgumentParser(description='Prepare panorama images',
                                     formatter_class=argparse.ArgumentDefaultsHelpFormatter)

    parser.add_argument('-r', '--resolution', dest='resolution', type=lambda s: max(int(s), 0), default=0,
                        help='resolution of exported images')

    parser.add_argument('-f', '--format', dest='format', default='webp', choices=['webp', 'png'],
                        help='format of exported images')

    parser.add_argument('-q', '--quality', dest='quality', default=90, type=lambda q: max(min(int(q), 100), 1),
                        help='quality of exported images')

    parser.add_argument('-t', '--threads', dest='threads', default=os.cpu_count(),
                        type=lambda t: max(min(int(t), os.cpu_count()), 1), help='number of threads to spawn')

    parser.add_argument('-i', '--input', dest='input', default='resources/panoramas', type=str,
                        help='location of unprocessed panoramas')

    parser.add_argument('-o', '--output', dest='output', default='public/img/panoramas',
                        type=str, help='output location of exported images')

    parser.add_argument('-l', '--levels', dest='levels', default=3,
                        type=lambda l: max(min(int(l), 0), 8), help='levels of nested directories')

    parser.add_argument('--copy', dest='copy', action=argparse.BooleanOptionalAction, default=False,
                        help='skips image processing and just copies files to output location')

    args = parser.parse_args()

    files = os.listdir(args.input)

    if not os.path.isdir(args.output):
        os.mkdir(args.output)

    if args.levels > 0:
        for f in files:
            lvl = generatePath(args.levels, f, args.output)

            if not os.path.exists(lvl):
                os.makedirs(lvl)

    with Pool(processes=args.threads) as p:
        for _ in tqdm(
                p.imap(
                    resize,
                    [(args.copy, args.resolution, args.format, args.quality, file, args.input, generatePath(args.levels, file, args.output))
                     for file in files]),
                total=len(files)):
            pass


if __name__ == '__main__':
    main()
