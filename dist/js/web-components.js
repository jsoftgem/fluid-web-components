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
                fieldGroup: "@",
                fieldValue: "@",
                fieldLabel: "@",
                change: "&",
                name: "@",
                method: "@"
            },
            restrict: "AE",
            replace: true,
            template: tc.get("templates/fluid-select.html"),
            link: function (scope, element, attr) {
                scope.loaded = false;

                if (attr.label) {
                    scope.label = attr.label;
                }

                scope.load = function () {
                    if (attr.sourceUrl) {
                        scope.isLoading = true;
                        h({method: scope.method, url: attr.sourceUrl}).success(function (sourceList) {
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

                if (!scope.name && attr.label) {
                    scope.name = attr.label.trim().split(" ").join("_");
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

                scope.$watch(function () {
                    return attr.sourceUrl;
                }, function () {
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
 * Created by Jerico on 10/09/2015.
 */
angular.module("fluid.webComponents.fluidSubTable", [])
    .directive("fluidSubtable", ["$templateCache", "$compile", function (tc, c) {

        return {
            restrict: "AE",
            template: tc.get("templates/fluid-subtable.html"),
            transclude: true,
            replace: true,
            scope: {model: "=", validate: "&"},
            link: function (scope, element, attr) {

                scope.columns = [];

                if (!scope.model) {
                    scope.model = [];
                }

                if (attr.sourceUrl) {
                    scope.sourceUrl = attr.sourceUrl;
                }


                var modal = element.find(".modal");


                scope.validate = function (value) {
                    return true;
                };

                scope.save = function (type, item) {
                    if (type === "Create") {
                        if (item) {
                            if (scope.validate) {
                                if (scope.validate({value: item})) {
                                    scope.model.push(item);
                                    scope.hideModal();
                                }
                            } else {
                                scope.model.push(item);
                                scope.hideModal();
                            }

                            console.debug("create.item", item);
                        }
                    } else if (type === "Edit") {
                        if (scope.validate) {
                            if (scope.validate({value: item})) {
                                scope.hideModal();
                            }
                        } else {
                            scope.hideModal();
                        }
                    }

                };

                scope.hideModal = function () {
                    modal.modal("hide");
                };

                scope.showModal = function (action, item, $index) {
                    modal.modal("show");
                    if (action === "create") {
                        scope.action = "Create";
                        scope.item = undefined;
                    } else if (action === "edit") {
                        scope.action = "Edit";
                        scope.index = $index;
                        scope.item = scope.model[scope.index];
                    }

                };

                scope.change = function (item) {
                    if (item === "Create") {
                        scope.action = item;
                        scope.selectValue = undefined;
                        modal.modal("show");
                    }
                };

                scope.select = function (item) {
                    scope.selectedItem = item;
                }

                scope.delete = function () {
                    scope.model.splice(scope.index, 1);
                    scope.hideModal();
                };


                var transclude = element.find("ng-transclude");
                transclude.find("fluid-subcolumn").each(function () {
                    var column = JSON.parse($(this).attr("column"));
                    scope.columns.push(column);
                });

                if (attr.label) {
                    scope.label = attr.label;
                }
                if (!attr.keyVar) {
                    throw "KeyVar is required.";
                }

                setTable(element, attr.keyVar, c, scope);
                transclude.remove();

            }
        }

    }])
    .directive("fluidSubcolumn", [function () {

        return {
            scope: false,
            restrict: "AE",
            template: "<div ng-transclude></div>",
            link: function (scope, element, attr) {


                var column = {};

                if (attr.name) {
                    column.name = attr.name;
                } else {
                    throw "Name attribute is required.";
                }

                if (attr.header) {
                    column.header = attr.header;
                }

                if (attr.value) {
                    column.value = attr.value;
                }
                column.row = element.find("[ng-transclude]").find(".column-row").html();
                column.form = element.find("[ng-transclude]").find(".column-form").html();
                element.attr("column", JSON.stringify(column));

            },
            transclude: true
        }

    }]);


function setTable(element, keyVar, compile, scope) {

    var table = element.find("table");

    var tr = $("<tr>").attr("ng-repeat", keyVar + " in model track by $index");


    tr.attr("ng-click", "showModal('edit'," + keyVar + ",$index)");

    for (var i = 0; i < scope.columns.length; i++) {
        var col = scope.columns[i];
        var td = $("<td>");
        console.debug("subColumn.createdTd.col.row", col.row);
        if (/<[a-z][\s\S]*>/i.test(col.row)) {
            $(col.row).appendTo(td);
        } else {
            td.html(col.row);
        }
        td.appendTo(tr);
        console.debug("subColumn.createdTd", td);
    }

    tr.appendTo(table);

    compile(table)(scope);

    var modal = element.find(".modal");

    var form = modal.find(".modal-content");
    form.attr("ng-submit", "save(action," + keyVar + ")");

    modal.on("hidden.bs.modal", function (e) {
        scope.action = undefined;
    });


    var modalBody = modal.find(".modal-body");

    for (var i = 0; i < scope.columns.length; i++) {
        var col = scope.columns[i];
        $(col.form).appendTo(modalBody);
    }

    compile(modal.contents())(scope);


};/**
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
                } else if (element.hasClass("fluid-subtable")) {
                    element.find(".panel").addClass("panel-info");
                    element.find(".modal").addClass("modal-")
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
                } else if (element.hasClass("fluid-subtable")) {
                    element.find(".panel").addClass("panel-warning");
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
                } else if (element.hasClass("fluid-subtable")) {
                    element.find(".panel").addClass("panel-danger");
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
                } else if (element.hasClass("fluid-subtable")) {
                    element.find(".panel").addClass("panel-success");
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
                } else if (element.hasClass("fluid-subtable")) {
                    element.find(".panel").addClass("panel-primary");
                }
            }
        }
    }]);;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents", ["angular.filter", "fluid.webComponents.bootstrap", "fluid.webComponents.fluidCache", "fluid.webComponents.fluidSelect", "fluid.webComponents.fluidSubTable", "wcTemplates"])
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
        scope.labelList = [{"label2": "rer", "label": "wer"}, {"label": "3", "label2": "w"}];
    }]);;angular.module('wcTemplates', ['templates/fluid-select.html', 'templates/fluid-subtable.html']);

angular.module("templates/fluid-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-select.html",
    "<label class=\"control-label fluid-select\">{{label}}<div class=\"btn-group fluid-select-dropdown\"><button class=\"btn btn-lg dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" ng-click=\"look()\" aria-expanded=\"false\"><span class=\"label\"></span> <span ng-if=\"!model\">...</span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"><li ng-if=\"isLoading\"><a>Loading {{label ? label : 'selection'}} <i class=\"fa fa-spinner fa-spin\"></i></a></li></ul></div></label>");
}]);

angular.module("templates/fluid-subtable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-subtable.html",
    "<div class=\"fluid-subtable\"><ng-transclude></ng-transclude><div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-dialog\"><form class=\"modal-content\" role=\"form\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">{{label}}</h4></div><div class=\"modal-body\"></div><div class=\"modal-footer\"><div ng-switch=\"action\"><button type=\"submit\" class=\"btn btn-info btn-lg create\">{{action == 'Edit' ? 'Update' : action}}</button> <button ng-if=\"action=='Edit'\" type=\"button\" class=\"btn btn-danger btn-lg\" ng-click=\"delete()\">Delete</button> <button type=\"button\" class=\"btn btn-danger btn-lg\" ng-click=\"hideModal()\">Cancel</button></div></div></form></div></div><div class=\"panel\"><div class=\"panel-heading\"><span class=\"panel-title\"><b>{{label}}</b></span><div class=\"panel-title pull-right hidden-xs hidden-sm\"><button type=\"button\" class=\"btn btn-lg btn-info\" ng-click=\"showModal('create')\"><i class=\"fa fa-plus\"></i></button> <button ng-if=\"sourceUrl\" type=\"button\" class=\"btn btn-lg btn-warning\"><i class=\"fa fa-search\"></i></button></div><div class=\"panel-title pull-right hidden-md hidden-lg\"><fluid-select change=\"change(item)\" info values=\"Create,Search\" model=\"selectValue\"></fluid-select></div></div><table class=\"panel-body table table-striped table-condensed table-hover\"><thead><th ng-repeat=\"col in columns\">{{col.header}}</th></thead><tbody></tbody></table></div></div>");
}]);
