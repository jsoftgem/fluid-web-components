/**
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
