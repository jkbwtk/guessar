<?php

require_once 'src/php/controllers/DefaultController.php';
require_once 'src/php/controllers/ViewController.php';
require_once 'Route.php';

class Router {
    public static array $routes;

    public static function get($path, $controller, $action) {
        self::$routes[$path] = new Route($path, $controller, $action, RouteTypes::GET);
    }

    public static function post($path, $controller, $action) {
        self::$routes[$path] = new Route($path, $controller, $action, RouteTypes::POST);
    }

    public static function run($path) {
        if (!array_key_exists($path, self::$routes)) {
            return print(AppController::get404View());
        }

        $controller = self::$routes[$path]->controller;
        $action = self::$routes[$path]->action;

        $object = new $controller;
        $object->$action();
    }
}
