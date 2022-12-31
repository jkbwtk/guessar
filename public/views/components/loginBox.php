<div class="auth-box" id="authBox">
  <h1 class="auth-title">Log In</h1>
  <div class="auth-hint-container">
    <p class="auth-hint" id="authHint">Log in with your email here.</p>
  </div>

  <form class="auth-form" id="authForm">
    <div class="auth-field-group">
      <input class="auth-input" type="email" id="authEmail" name="email" placeholder="Email" autocomplete="email" required>

      <div class="auth-password-group">
        <img class="auth-show-password" src="/public/img/eyeIcon.svg">
        <input class="auth-input" type="password" id="authPassword" name="password" minlength="8" maxlength="64" pattern="[a-zA-Z0-9!@#$%^&*()\-+<>?:;&quot;&#39;\[\]{}`~=_\+/,\.]+" placeholder="Password" required>
      </div>
    </div>

    <button class="button-small auth-submit-button" id="authSubmit" type="submit">Log In</button>
  </form>

  <div class="auth-alt-group">
    <button class="auth-continue-google">Continue with Google</button>
    <button class="auth-continue-github">Continue with Github</button>
  </div>

  <div class="auth-option-group">
    <div class="auth-option">
      <span>Forgot password?</span>
      <a href="/reset-password">Reset</a>
    </div>
    <div class="auth-option">
      <span>Don't have account?</span>
      <a id="authSwitchRegister" href="/register">Sign up</a>
    </div>
  </div>
</div>