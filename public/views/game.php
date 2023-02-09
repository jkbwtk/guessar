<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <?php include 'public/views/components/metatags.php' ?>

  <title>Guessar - Singleplayer</title>

  <link rel="preload" href="/public/fonts/SquarishSansCTRegular.woff2" as="font" type="font/woff2"
    crossorigin="anonymous">
  <link rel="preload" href="/public/img/logo.svg" as="image">
  <link rel="preload" href="/public/img/flag.svg" as="image">

  <link rel="icon" type="image/svg+xml" href="/public/img/favicon.ico" />
  <link rel="stylesheet" type="text/css" href="/public/css/style.css">
  <link rel="stylesheet" type="text/css" href="/public/css/game.css">

  <script type="module" src="/public/js/index.js"></script>
  <script type="module" src="/public/js/game.js"></script>
</head>

<body style="overflow: hidden;">
  <div class="container" id="container">
    <?php include 'public/views/components/topBar.php' ?>

    <div class="game-start-container" id="gameStartContainer">
      <div class="game-start-location">
        <img class="game-start-location-icon" src="/public/img/locations/sanAndreas.png" alt="">
        <span class="game-start-location-name">San Andreas</span>
      </div>


      <div class="game-start-settings">
        <div class="game-start-settings-bar">
          <span>Difficulty</span>
          <div class="game-start-divider"></div>
          <button class="button-aux game-start-button button-awaitable" id="startButton">Play</button>
        </div>

        <div class="game-start-settings-grid">
          <img class="game-start-setting-icon" src="/public/img/zoom.svg">
          <span class="game-start-setting-name">Zoom</span>
          <input class="game-start-setting-input" id="roundZoomInput" type="checkbox" checked="true">

          <img class="game-start-setting-icon" src="/public/img/pan.svg">
          <span class="game-start-setting-name">Pan</span>
          <input class="game-start-setting-input" id="roundPanInput" type="checkbox" checked="true">

          <img class="game-start-setting-icon" src="/public/img/move.svg">
          <span class="game-start-setting-name">Move</span>
          <input class="game-start-setting-input" id="roundMoveInput" type="checkbox" checked="true">

          <img class="game-start-setting-icon" src="/public/img/timer.svg">
          <span class="game-start-setting-name">Round time:</span>
          <span class="game-start-setting-value" id="roundTimeLabel">0</span>

          <input class="game-start-setting-input" id="roundTimeInput" type="range" value="0" min="0" max="300" step="30"
            style="grid-column: 1 /span 3; width: 100%">

          <span class="game-start-settings-hint">(Set to 0s for no time limit)</span>
        </div>
      </div>
    </div>
  </div>
</body>

</html>