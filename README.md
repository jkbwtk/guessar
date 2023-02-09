![](https://github.com/jkbwtk/guessar/blob/4f9f4ad622ae000350bcea25eca7287fecb687a6/public/img/logo.svg)

# Guessar
GTA:SA geo guessing website

Demo available at https://guessar.com

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

8. Navigate to http://localhost:4000/ in your browser

## Screenshots
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_home.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_login.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_register.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_game_start.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_game.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_round_summary.png)
![](https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Desktop_leaderboard.png)


<p float="center">
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_home.png" width="250" />
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_login.png" width="250" /> 
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_register.png" width="250" />
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_game_start.png" width="250" />
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_game.png" width="250" />
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_round_summary.png" width="250" />
  <img src="https://github.com/jkbwtk/guessar/blob/14ff948cafa5d70106ee8ebe2d8514874b1717da/demos/Mobile_leaderboard.png" width="250" />
</p>

