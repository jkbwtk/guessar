<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guessar - Homepage</title>

  <link rel="preload" href="/public/fonts/SquarishSansCTRegular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
  <link rel="preload" href="/public/img/logo.svg" as="image">
  <link rel="preload" href="/public/img/flag.svg" as="image">

  <link rel="icon" type="image/svg+xml" href="/public/img/favicon.ico" />
  <link rel="stylesheet" type="text/css" href="/public/css/style.css">

  <script type="module" src="/public/js/index.js"></script>
</head>

<body>
  <div class="container">
    <?php include 'public/views/components/topBar.php' ?>

    <h1 class="text-logo">GTA:SA GeoGuesser</h1>
    <h2 class="catchphrase">Every panorama is personalized.</h2>

    <button class="button-big" style="align-self: center;">Single Player</button>
    <button class="button-aux" style="align-self: center;">Challenge mode</button>

    <div class="background04"></div>
  </div>
</body>

</html>