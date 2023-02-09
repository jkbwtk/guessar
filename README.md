![](https://github.com/jkbwtk/guessar/blob/4f9f4ad622ae000350bcea25eca7287fecb687a6/public/img/logo.svg)

# Guessar
GTA:SA geo guessing website


## Requirements
- Node.js
- Docker
- Python

## Development environment setup
1. Install npm dependencies
```bash
npm ci
```

2. Install python dependencies
```bash
pip install -r requirements.txt
```

3. Transpile typescript to javascript
```bash
npm run build
```

4. Copy `leaflet.css` to `public/css/`
```bash
cp node_modules/leaflet/dist/leaflet.css public/css/
```

5. Generate public resources
```bash
python tools/panoramaOptimizer.py
python tools/tileGenerator.py
```

6. Generate database template
```bash
python tools/databaseGenerator.py
```

7. Start docker containers
```bash
docker compose up
```
