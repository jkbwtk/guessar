<?php

require_once 'AppController.php';

class DefaultController extends AppController {
    public function index() {
        $this->sendUserCookie();
        $this->render('index');
    }

    public function explore() {
        $this->sendUserCookie();
        $this->render('explore');
    }
}
