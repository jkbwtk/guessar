<?php
function getAuthTypeFromURI() {
  $path = trim($_SERVER['REQUEST_URI'], '/');
  $path = parse_url($path, PHP_URL_PATH);
  $path = trim(explode('/', $path)[0]);

  print($path === 'login' ? 'login-box' : 'register-box');
}
?>

<div class="auth-box <?php getAuthTypeFromURI() ?>" id="authBox">
  <h1 class="login-title login-element">Log In</h1>
  <p class="login-hint login-element">Log in with your email here.</p>

  <h1 class="login-title register-element">Sign Up</h1>
  <p class="login-hint register-element">Create a free account with your email.</p>

  <form action="/">
    <div class="login-field-group">
      <input class="login-input" type="email" id="logEmail" name="email" placeholder="Email" autocomplete="email">
      <input class="login-input register-element" type="text" id="logUsername" name="username" placeholder="Username" autocomplete="username">

      <div class="login-password-group">
        <img class="login-show-password" src="/public/img/eyeIcon.svg">
        <input class="login-input" type="password" id="logPassword" name="password" placeholder="Password">
      </div>

      <div class="login-password-group register-element">
        <img class="login-show-password" src="/public/img/eyeIcon.svg">
        <input class="login-input" type="password" id="logConfirmPassword" name="password" placeholder="Repeat Password">
      </div>
    </div>

    <button class="button-small login-submit-button login-element" id="logLogin" type="submit">Log In</button>
    <!-- <button class="button-small login-submit-button register-element" id="logRegister" type="submit">Sign Up</button> -->
  </form>

  <div class="login-alt-group">
    <button class="login-continue-google">Continue with Google</button>
    <button class="login-continue-github">Continue with Github</button>
  </div>

  <div class="login-option-group">
    <div class="login-option">
      <span>Forgot password?</span>
      <a href="/reset-password">Reset</a>
    </div>
    <div class="login-option register-element">
      <span>Already have account?</span>
      <a id="logSwitchLogin">Log In</a>
    </div>

    <div class="login-option login-element">
      <span>Don't have account?</span>
      <a id="logSwitchRegister">Sign up</a>
    </div>
  </div>
</div>