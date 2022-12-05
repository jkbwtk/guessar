<?php

enum RouteTypes {
    case GET;
    case POST;
    case PUT;
    case DELETE;
}

class Route {
    public string $path;
    public string $controller;
    public string $action;
    public RouteTypes $type;

    public function __construct($path, $controller, $action, $type) {
        $this->path = $path;
        $this->controller = $controller;
        $this->action = $action;
        $this->type = $type;
    }
}
