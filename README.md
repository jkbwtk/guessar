![](https://github.com/jkbwtk/guessar/blob/4f9f4ad622ae000350bcea25eca7287fecb687a6/public/img/logo.svg)

# Guessar
GTA:SA geo guessing website


## Requirements
- Node.js
- Docker
- Python

## Setup
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

4. Generate public resources
```bash
python tools/panoramaOptimizer.py
python tools/tileGenerator.py
```

5. Start docker containers
```bash
docker compose up
```
