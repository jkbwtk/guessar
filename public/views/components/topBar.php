<div class="top-bar">
  <button class="button-small nav-burger-mobile top-mobile" id="navBurgerMobile">
    <img src="public/img/burgerMobile.svg" alt="More" />
  </button>

  <a class="branding" href="/">
    <img class="logo" src="/public/img/logo.svg" alt="Guessar" />
    <img class="icon" src="/public/img/flag.svg" alt="Guessar" />
  </a>

  <nav class="nav-bar top-desktop" id="navBar">
    <a href="/" class="nav-link">Home</a>
    <a class="nav-link">Gamemodes</a>
    <a class="nav-link">Leaderboard</a>
    <a class="nav-link">Explore</a>
    <a class="nav-link">About</a>
    <img class="nav-link" id="navBurger" src="/public/img/burger.svg"></img>
  </nav>

  <div class="nav-menu nav-menu-hidden" id="navMenu">
    <a class="nav-link">Privacy</a>
    <a class="nav-link">Github</a>
  </div>

  <div class="nav-menu-mobile" id="navMenuMobile">
    <a href="/" class="nav-link nav-link-mobile">Home</a>
    <a class=" nav-link nav-link-mobile">Gamemodes</a>
    <a class="nav-link nav-link-mobile">Leaderboard</a>
    <a class="nav-link nav-link-mobile">Explore</a>
    <a class="nav-link nav-link-mobile">About</a>
    <a class="nav-link nav-link-mobile">Privacy</a>
    <a class="nav-link nav-link-mobile">Github</a>

    <a href="/login"><button class="button-small" id="topLoginMobile">Log In</button></a>
    <a href="/register"><button class="button-small" id="topRegisterMobile">Sign Up</button></a>


    <p style="margin-top: auto;">
      <?
      print($_SERVER['HTTP_USER_AGENT']);
      ?>
    </p>
  </div>

  <div class="auth-group top-desktop">
    <a href="/login"><button class="button-small" id="topLogin">Log In</button></a>
    <a href="/register"><button class="button-small" id="topRegister">Sign Up</button></a>
  </div>

  <button class="button-small top-avatar-mobile top-mobile" id=""><img src="/public/img/defaultAvatar.svg" /></button>
</div>