import csv
import os
from io import TextIOWrapper
import re
from tqdm import tqdm

from sqlalchemy.sql.expression import text


class Context():
    def __init__(self, ctx: TextIOWrapper):
        self.ctx = ctx

    def writeNext(self, data: str):
        self.ctx.write(data.strip())
        self.ctx.write('\n\n')

    def close(self) -> None:
        return self.ctx.close()


def generatePath(levels: int, filename: str, outDir: str):
    n, e = os.path.splitext(filename)
    p = outDir

    for i in range(levels):
        p = os.path.join(p, n[i])

    return p


def loadCoords(path: str):
    coords = []

    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for r in reader:
            r['neighbors'] = []

            r['position_x'] = float(r['position_x'])
            r['position_y'] = float(r['position_y'])
            r['position_z'] = float(r['position_z'])
            coords.append(r)

    return coords


def panoramaAvailable(panoramaUUID: str):
    baseFilename = f'{generatePath(3, panoramaUUID, "public/img/panoramas")}/{panoramaUUID}_'

    for i in range(6):
        if not os.path.exists(f'{baseFilename}{i}.webp'):
            return False

    return True


def filterAvailablePanoramas(coords: list):
    coords = list(
        tqdm(
            filter(lambda c: panoramaAvailable(c['uuid']),
                   coords),
            total=len(coords),
            desc='Filtering panoramas'))

    return coords


def processNeighbors(coords: list, distance: float, height: float):
    c = coords.copy()

    proxy = [(coord['position_x'], coord['position_y'], coord['position_z'], coord['uuid']) for coord in c]

    for i, source in tqdm(enumerate(proxy), total=len(c), desc='Processing neighbors'):
        for target in proxy:
            if source[3] == target[3]:
                continue

            dx = target[0] - source[0]
            if abs(dx) > distance:
                continue

            dy = target[1] - source[1]
            if abs(dy) > distance:
                continue

            dz = target[2] - source[2]
            if abs(dz) > height:
                continue

            length = (dx**2 + dy**2 + dz**2)**0.5
            if length < distance and abs(dz) < height:
                c[i]['neighbors'].append(target[3])

    return c


def dropTableIfExists(ctx: Context, table: str):
    ctx.writeNext(f'DROP TABLE IF EXISTS "{table}";')


def createTables(ctx: Context):
    tables = list(filter(lambda f: f.endswith('.sql') and f != 'database.sql', os.listdir('resources/database')))
    print('Creating tables: ', tables)
    reg = r'^\d{2}_'

    for table in tables:
        if re.match(reg, table):
            tableName = table[3:-4]
        else:
            tableName = table[:-4]

        dropTableIfExists(ctx, tableName)

        with open(f'resources/database/{table}', 'r', encoding='utf-8') as f:
            ctx.writeNext(f.read())


def populateViews(ctx: Context):
    coords = loadCoords('resources/coords.csv')
    coords = filterAvailablePanoramas(coords)
    coords = processNeighbors(coords, 20, 8)

    for c in tqdm(coords, total=len(coords), desc='Populating views'):
        raw = text('INSERT INTO "Views" (uuid, position_x, position_y, position_z, position_rad, in_vehicle, weather_region, weather_old, weather_new, wavyness, time_hours, time_minutes, quaternion_x, quaternion_y, quaternion_z, quaternion_w, neighbors) VALUES (:uuid, :position_x, :position_y, :position_z, :position_rad, :in_vehicle, :weather_region, :weather_old, :weather_new, :wavyness, :time_hours, :time_minutes, :quaternion_x, :quaternion_y, :quaternion_z, :quaternion_w, :neighbors);')\
            .bindparams(
                uuid=c['uuid'],
                position_x=c['position_x'],
                position_y=c['position_y'],
                position_z=c['position_z'],
                position_rad=c['position_rad'],
                in_vehicle=c['in_vehicle'],
                weather_region=c['weather_region'],
                weather_old=c['weather_old'],
                weather_new=c['weather_new'],
                wavyness=c['wavyness'],
                time_hours=c['time_hours'],
                time_minutes=c['time_minutes'],
                quaternion_x=c['quaternion_x'],
                quaternion_y=c['quaternion_y'],
                quaternion_z=c['quaternion_z'],
                quaternion_w=c['quaternion_w'],
                neighbors=f'{{{",".join(c["neighbors"])}}}'
        ).compile(compile_kwargs={"literal_binds": True})

        ctx.writeNext(raw.string)


def main():
    if not os.path.exists('docker/postgres'):
        os.makedirs('docker/postgres')

    ctx = Context(open('docker/postgres/database.sql', 'w', encoding='utf-8'))

    createTables(ctx)
    populateViews(ctx)

    ctx.close()


if __name__ == '__main__':
    main()
