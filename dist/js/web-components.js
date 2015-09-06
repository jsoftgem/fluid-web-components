/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidCache", [])
    .service("fluidCache.service", ["$templateCache", function (tc) {
        this.getCache = function (key) {
            return tc.get(key);
        };
        this.putCache = function (key, data) {
            tc.put(key, data);
            console.debug("fluidCache.service.put.key", key);
            console.debug("fluidCache.service.put.data", data);
        };
        return this;
    }])
    .factory("fluidCache.injector", ["fluidCache.service", function (fs) {

        return {
            "response": function (response) {
                console.debug("fluidCache.injector.response", response);
                if (fs.getCache(response.config.url) === false) {
                    fs.putCache(response.config.url, response.data);
                }
                return response;
            }
        }
    }])
    .directive("fluidCache", ["fluidCache.service", "$compile", function (fs) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                element.ready(function () {
                    var obj = scope.$$childHead.$eval(attr.fluidCache);
                    console.debug("fluidCache.cache", obj);
                    if (obj) {
                        fs.putCache(obj, false);
                    }
                });
            }
        }
    }]).config(["$httpProvider", function (hp) {
        hp.interceptors.push('fluidCache.injector');
    }]);;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidSelect", [])
    .directive("fluidSelect", ["$templateCache", "$http", "$compile", function (tc, h, c) {
        return {
            scope: {
                model: "=",
                label: "@",
                fieldGroup: "@",
                fieldValue: "@",
                fieldLabel: "@",
                sourceUrl: "@",
                change: "&",
                name: "@",
                method: "@"
            },
            restrict: "AE",
            replace: true,
            template: tc.get("templates/fluid-select.html"),
            link: function (scope, element, attr) {
                scope.loaded = false;

                scope.load = function () {
                    if (scope.sourceUrl) {
                        scope.isLoading = true;
                        h({method: scope.method, url: scope.sourceUrl}).success(function (sourceList) {
                            scope.sourceList = sourceList;
                            scope.addElements();
                            c(dropDown.contents())(scope);
                            scope.isLoading = false;
                            scope.loaded = true;
                        });
                    } else if (attr.values) {
                        scope.isLoading = true;
                        scope.sourceList = attr.values.split(",");
                        scope.addElements();
                        c(dropDown.contents())(scope);
                        scope.isLoading = false;
                        scope.loaded = true;
                    }

                };

                if (!scope.method) {
                    scope.method = "GET";
                }

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }

                scope.options = "item in sourceList";

                if (scope.fieldGroup) {
                    scope.options += "  | groupBy " + scope.fieldGroup;
                }


                var itemLabel = scope.fieldLabel ? "{{item." + scope.fieldLabel + "}}" : "{{item}}";

                var itemValue = scope.fieldValue ? "item." + scope.fieldValue : "item";

                var dropDown = element.find("ul.dropdown-menu");


                var label = element.find("span.label");
                label.attr("ng-if", "model");
                if (scope.fieldValue) {
                    label.attr("ng-repeat", "item in sourceList | filter : {" + scope.fieldValue + ": model}");
                } else {
                    label.attr("ng-repeat", "item in sourceList | filter : model");
                }

                label.html(itemLabel);

                c(label)(scope);

                scope.addElements = function () {
                    var listElements = $("<li>").addClass("fluid-select-item").attr("ng-repeat", scope.options).appendTo(dropDown);
                    var item = $("<a>").attr("ng-click", "select(" + itemValue + ",item,$index)").addClass("morris-hover-point").text(itemLabel).appendTo(listElements);
                };

                scope.$watch(function (scope) {
                    return scope.sourceUrl;
                }, function (value) {
                    scope.loaded = false;
                });

                scope.$watch(function () {
                    return attr.values;
                }, function (value) {
                    scope.loaded = false;
                });

                scope.select = function (item, full, $index) {
                    scope.model = item;
                    scope.change({item: item, full: full, index: $index});
                };


                scope.$watch(function (scope) {
                    return scope.model;
                }, function (value) {
                    if (value) {
                        if (!scope.loaded) {
                            scope.load();
                        }
                    }
                });

                scope.look = function () {
                    if (!scope.loaded) {
                        scope.load();
                    }
                }

            }
        }

    }
    ])
;
;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.bootstrap", [])
    .directive("info", [function () {
        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.hasClass("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-info");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-info");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-info");
                }

            }
        }
    }]).directive("warning", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.hasClass("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-warning");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-warning");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-warning");
                }
            }
        }
    }]).directive("danger", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.hasClass("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-danger");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-danger");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-danger");
                }
            }
        }
    }]).directive("success", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.hasClass("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-success");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-success");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-success");
                }
            }
        }
    }]).directive("primary", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.hasClass("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-primary");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-primary");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-primary");
                }
            }
        }
    }]);;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents", ["angular.filter", "fluid.webComponents.bootstrap", "fluid.webComponents.fluidCache", "fluid.webComponents.fluidSelect", "wcTemplates"])
    .directive("fluidDisabled", [function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                scope.$watch(attr.fluidDisabled,
                    function (disabled) {
                        if (disabled) {
                            element.find("input").each(function () {
                                $(this).attr("disabled", "");
                            });
                            element.find("button").each(function () {
                                $(this).attr("disabled", "");
                            });
                            element.find("a").each(function () {
                                $(this).attr("disabled", "");
                            });
                        } else {
                            element.find("input").each(function () {
                                $(this).removeAttr("disabled");
                            });
                            element.find("button").each(function () {
                                $(this).removeAttr("disabled");
                            });
                            element.find("a").each(function () {
                                $(this).removeAttr("disabled");
                            });
                        }
                    });
            }
        }
    }])
    .controller("sampleCtrl", ["$scope", function (scope) {
    }]);;angular.module('wcTemplates', ['templates/fluid-select.html']);

angular.module("templates/fluid-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-select.html",
    "<label class=\"control-label fluid-select\">{{label}}<div class=\"btn-group fluid-select-dropdown\"><button class=\"btn dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" ng-click=\"look()\" aria-expanded=\"false\"><span class=\"label\"></span> <span ng-if=\"!model\">...</span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"><li ng-if=\"isLoading\"><a>Loading {{label ? label : 'selection'}} <i class=\"fa fa-spinner fa-spin\"></i></a></li></ul></div></label>");
}]);
