<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <?php include 'public/views/components/metatags.php' ?>

  <title>Guessar - Leaderboard</title>

  <link rel="preload" href="/public/fonts/SquarishSansCTRegular.woff2" as="font" type="font/woff2"
    crossorigin="anonymous">
  <link rel="preload" href="/public/img/logo.svg" as="image">
  <link rel="preload" href="/public/img/flag.svg" as="image">

  <link rel="icon" type="image/svg+xml" href="/public/img/favicon.ico" />
  <link rel="stylesheet" type="text/css" href="/public/css/style.css">
  <link rel="stylesheet" type="text/css" href="/public/css/leaderboard.css">

  <script type="module" src="/public/js/index.js"></script>
  <script type="module" src="/public/js/leaderboard.js"></script>
</head>

<body>
  <div class="container">
    <?php include 'public/views/components/topBar.php' ?>

    <span class="leaderboard-title">Leaderboard</span>

    <div class="leaderboard-container" id="gameLeaderboard">
      <span class="leaderboard-header">No.</span>
      <span class="leaderboard-header">Username</span>
      <span class="leaderboard-header">Score</span>
      <span class="leaderboard-header">Time</span>
      <span class="leaderboard-header">Date</span>

      <?
      $counter = 0;
      foreach ($games as $game) {
        $user = $users[$game->getUserId()];
        $counter += 1;
        ?>

        <span class="leaderboard-item" gameId="<? echo $game->getUniqid() ?>">
          <? echo $counter ?>
        </span>

        <div class="leaderboard-item leaderboard-user" gameId="<? echo $game->getUniqid() ?>">
          <img src="<?
          $avatar = $user->getAvatar();
          if ($avatar === null)
            print('/public/img/defaultAvatar.svg');
          else
            print('/api/v1/avatar/' . $avatar);
          ?>">
          <span>
            <? echo
              strlen($user->getUsername()) > 15
              ? substr($user->getUsername(), 0, 15) . '...'
              : $user->getUsername()
              ?>
          </span>
        </div>

        <span class="leaderboard-item" gameId="<? echo $game->getUniqid() ?>">
          <? echo round($game->getFinalScore()) ?>
        </span>

        <span class="leaderboard-item" gameId="<? echo $game->getUniqid() ?>">
          <?
          if ($game->getFinalTime() > 3600) {
            echo gmdate('H:i:s', $game->getFinalTime());
          } else {
            echo gmdate('i:s', $game->getFinalTime());
          }
          ?>
        </span>

        <span class="leaderboard-item" gameId="<? echo $game->getUniqid() ?>">
          <?
          if (time() - $game->getCreatedAt() < 86400) {
            $time_elapsed = time() - $game->getCreatedAt();

            if ($time_elapsed < 60) {
              echo $time_elapsed . 's';
            } else if ($time_elapsed < 3600) {
              echo round($time_elapsed / 60) . 'm';
            } else {
              echo round($time_elapsed / 3600) . 'h';
            }

            echo ' ago';
          } else {
            echo date('d/m/Y', $game->getCreatedAt());
          }
          ?>
        </span>
      <? } ?>
    </div>

    <div class="background04"></div>
  </div>
</body>

</html>