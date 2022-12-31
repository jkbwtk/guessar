<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <?php include 'public/views/components/metatags.php' ?>

  <title>Guessar - Register</title>

  <link rel="preload" href="/public/fonts/SquarishSansCTRegular.woff2" as="font" type="font/woff2" crossorigin="anonymous">
  <link rel="preload" href="/public/img/logo.svg" as="image">
  <link rel="preload" href="/public/img/flag.svg" as="image">

  <link rel="icon" type="image/svg+xml" href="/public/img/favicon.ico" />
  <link rel="stylesheet" type="text/css" href="/public/css/style.css">
  <link rel="stylesheet" type="text/css" href="/public/css/auth.css">

  <script type="module" src="/public/js/register.js"></script>
</head>

<body style="overflow: hidden;">
  <div class="container">
    <?php include 'public/views/components/topBar.php' ?>

    <?php include 'public/views/components/registerBox.php' ?>
    <div class="background01"></div>
  </div>
</body>

</html>