<div class="user-widget" id="userWidget">
  <img class="user-widget-avatar" src="
  <?php
  $avatar = $sessionUser->getAvatar();
  if ($avatar === null) print('/public/img/defaultAvatar.svg');
  else print('/api/v1/avatar/' . $avatar);
  ?>
  ">

  <span class="user-widget-username">
    <?php
    $discriminator = str_pad($sessionUser->getDiscriminator(), 4, '0', STR_PAD_LEFT);
    print($sessionUser->getUsername() . '#' . $discriminator);
    ?>
  </span>
</div>