<?php

require 'Routing.php';

$path = trim($_SERVER['REQUEST_URI'], '/');
$path = parse_url($path, PHP_URL_PATH);


Router::get('', 'DefaultController', 'index');
Router::get('login', 'AuthController', 'login');
Router::get('register', 'AuthController', 'register');
Router::get('explore', 'DefaultController', 'explore');

Router::get('api/v1/views/random', 'ViewController', 'getRandomView');
Router::get('api/v1/views/view', 'ViewController', 'getView');
Router::get('api/v1/views/closest', 'ViewController', 'getClosestView');

Router::post('api/v1/auth/register', 'AuthController', 'apiRegister');
Router::post('api/v1/auth/login', 'AuthController', 'apiLogin');
Router::post('api/v1/auth/logout', 'AuthController', 'apiLogout');

Router::post('api/v1/avatar', 'AvatarController', 'uploadAvatar');
Router::get('api/v1/avatar', 'AvatarController', 'getAvatar');
Router::delete('api/v1/avatar', 'AvatarController', 'deleteAvatar');

Router::get('api/v1/user', 'UserController', 'getUser');

Router::run($path);
