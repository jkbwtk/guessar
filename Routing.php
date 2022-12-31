<?php

require_once 'src/php/controllers/DefaultController.php';
require_once 'src/php/controllers/ViewController.php';
require_once 'src/php/controllers/AuthController.php';
require_once 'src/php/controllers/AvatarController.php';
require_once 'src/php/controllers/UserController.php';
require_once 'Route.php';

class Router {
    public static array $paths;
    public static array $getRoutes;
    public static array $postRoutes;
    public static array $deleteRoutes;

    public static function get($path, $controller, $action) {
        self::$paths[$path] = $path;
        self::$getRoutes[$path] = new Route($path, $controller, $action, RouteTypes::GET);
    }

    public static function post($path, $controller, $action) {
        self::$paths[$path] = $path;
        self::$postRoutes[$path] = new Route($path, $controller, $action, RouteTypes::POST);
    }

    public static function delete($path, $controller, $action) {
        self::$paths[$path] = $path;
        self::$deleteRoutes[$path] = new Route($path, $controller, $action, RouteTypes::DELETE);
    }

    public static function getRoute($path, $method): ?Route {
        switch ($method) {
            case 'GET':
                if (!array_key_exists($path, self::$getRoutes)) return null;
                else return self::$getRoutes[$path];

            case 'POST':
                if (!array_key_exists($path, self::$postRoutes)) return null;
                else return self::$postRoutes[$path];

            case 'DELETE':
                if (!array_key_exists($path, self::$deleteRoutes)) return null;
                else return self::$deleteRoutes[$path];

            default:
                return null;
        }
    }

    public static function run($path) {
        if (!array_key_exists($path, self::$paths)) {
            // special case for non api calls
            if (strpos($path, 'api/') !== 0) return print(AppController::get404View());

            return AppController::throwNotFound();
        }

        $method = $_SERVER['REQUEST_METHOD'];
        $route = self::getRoute($path, $method);

        if ($route === null) return AppController::throwNotAllowed();

        $controller = $route->controller;
        $action = $route->action;

        $object = new $controller;
        $object->$action();
    }
}
