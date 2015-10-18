/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidSelect", [])
    .directive("fluidSelect", ["$templateCache", "$http", "$compile", "$injector", "$timeout", "$filter", "$q", function (tc, h, c, inj, t, f, q) {
        return {
            require: "ngModel",
            restrict: "AE",
            template: tc.get("templates/fluid-select.html"),
            link: function (scope, element, attr, ngModel) {
                console.debug("ngModel", ngModel);
                console.debug("scope", scope);
                var method = "GET";
                var sourceList = undefined;
                var fwcLabel = element.find(".fwc-label");
                var fieldValue = undefined;
                var fieldLabel = undefined;
                var loaded = false;

                if (attr.label) {
                    fwcLabel.html(attr.label);
                }
                if (!attr.method) {
                    method = "GET";
                }
                if (!attr.name && attr.label) {
                    attr.name = attr.label.trim().split(" ").join("_");
                }


                if (attr.fieldLabel) {
                    fieldLabel = attr.fieldLabel;
                }

                if (attr.fieldValue) {
                    fieldValue = attr.fieldValue;
                }

                var dropDown = element.find("ul.dropdown-menu");

                var loader = $("<li><a>Loading " + (attr.label ? attr.label : "selection") + " <i class='fa fa-spinner fa-spin'></i></a> </li>");

                var label = element.find("span.label");

                var lookupButton = element.find("button.look");

                lookupButton.click(function () {
                    look();
                });

                var look = function () {
                    if (!loaded) {
                        load();
                    }
                };

                var createList = function (items) {
                    loader.remove();
                    angular.forEach(items, function (item) {
                        var li = $("<li>").addClass("fluid-select-item");
                        var a = $("<a>").attr("href", "#").addClass("morris-hover-point").text(new getValue(item, fieldLabel).value).appendTo(li);
                        a.unbind("click");
                        a.click(function ($event) {
                            console.debug("fluid-select.click", item);
                            var value = new getValue(item, fieldValue).value;
                            t(function () {
                                ngModel.$setViewValue(value, $event);
                                t(function () {
                                    scope.$apply();
                                });
                            });
                        });
                        li.appendTo(dropDown);
                    });
                };

                var load = function () {
                    var deferred = q.defer();
                    dropDown.html(loader[0]);
                    if (attr.sourceUrl) {
                        h({method: method, url: attr.sourceUrl}).success(function (data) {
                            sourceList = data;
                            createList(data);
                            loaded = true;
                            deferred.resolve(sourceList);
                        });
                    } else if (attr.values) {
                        sourceList = attr.values.split(",");
                        createList(sourceList);
                        loaded = true;
                        deferred.resolve(sourceList);
                    } else if (attr.factory) {
                        sourceList = inj.get(attr.factory);
                        createList(sourceList);
                        loaded = true;
                        deferred.resolve(sourceList);
                    }

                    return deferred.promise;
                };

                var setValue = function (dataValue) {
                    if (dataValue) {
                        if (!loaded) {
                            load().then(function (data) {
                                var itemLabel = f("filter")(data, dataValue);
                                var value = new getValue(itemLabel[0], fieldLabel).value;
                                console.debug("setValue", value);
                                label.html(value);
                            });
                        } else {
                            var itemLabel = f("filter")(sourceList, dataValue);
                            var value = new getValue(itemLabel[0], fieldLabel).value;
                            console.debug("setValue", value);
                            label.html(value);
                        }
                    } else {
                        label.text("");
                    }
                };

                ngModel.$render = function () {
                    setValue(ngModel.$viewValue);
                };

                ngModel.$viewChangeListeners.push(function () {
                    ngModel.$render();
                });


            }
        }

    }
    ]);
