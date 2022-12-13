<?php

require 'Routing.php';

$path = trim($_SERVER['REQUEST_URI'], '/');
$path = parse_url($path, PHP_URL_PATH);


Router::get('', 'DefaultController', 'index');
Router::get('login', 'DefaultController', 'login');
Router::get('register', 'DefaultController', 'register');
Router::get('explore', 'DefaultController', 'explore');

Router::get('api/v1/views/random', 'ViewController', 'getRandomView');
Router::get('api/v1/views/view', 'ViewController', 'getView');

Router::run($path);
