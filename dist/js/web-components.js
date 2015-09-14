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
 * Created by Jerico on 10/09/2015.
 */
angular.module("fluid.webComponents.fluidLookup", [])
    .directive("fluidLookup", ["$http", "lookUp", function (h, lookUp) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                var method = "get";
                if (attr.method) {
                    method = attr.method;
                }
                element.unbind("click");

                element.bind("click", function (e) {
                    lookUp.open({
                        event: e,
                        method: method,
                        values: attr.values,
                        sourceUrl: attr.sourceUrl,
                        label: attr.label,
                        factory: attr.factory
                    });
                });


            }
        }
    }])
    .directive("fluidLookupGrid", ["$templateCache", function (tc) {
        var fluidLookUpGrid = {
            restrict: "AE",
            link: function (scope, element, attr) {
                element.addClass("grid");
                var grid = {};

                if (!attr.keyVar) {
                    throw "KeyVar attribute is required.";
                }

                if (attr.lookupTemplate) {
                    grid.html = tc.get(attr.lookupTemplate);
                } else {
                    grid.html = element.html();
                }

                grid.keyVar = attr.keyVar;
                element.parent().attr("lookup-type", "grid");
                element.parent().attr("grid", JSON.stringify(grid));
                element.remove();
            }

        };
        return fluidLookUpGrid;
    }])
    .service("lookUp", ["$compile", "$http", "$injector", "$timeout", function (c, h, inj, t) {

        this.open = function (options) {

            var event = options.event;
            var method = options.method;
            var sourceUrl = options.sourceUrl;
            var factory = options.factory;

            var scope = angular.element($(event.currentTarget)).scope();

            scope.label = options.label;

            var source = $(event.currentTarget);
            var modal = getModal();
            var loader = getLookupLoader();
            var oldHtml = $(event.currentTarget).html();

            var modalBody = modal.find(".modal-body");
            modalBody.addClass("fluid-lookup");

            if (source.attr("lookup-type") === "grid") {
                var grid = JSON.parse(source.attr("grid"));
                var selectorGrid = $("<div>").addClass("grid").attr("ng-repeat", grid.keyVar + " in data").appendTo(modalBody);
                selectorGrid.html(grid.html);
                if (source.attr("on-lookup")) {
                    selectorGrid.attr("ng-click", source.attr("on-lookup"));
                }
            } else {
                //TODO: table
            }

            console.debug("lookupFactory.modalBody", modalBody.html());
            c(modal)(scope);
            if (sourceUrl) {
                $(event.currentTarget).html(loader);
                h({
                    method: method,
                    url: sourceUrl
                }).success(function (data) {
                    $(event.currentTarget).html(oldHtml);
                    scope.data = data;
                    modal.modal("show");
                });
            } else if (factory) {
                t(function () {
                    scope.data = inj.get(factory);
                    console.debug("lookupFactory", scope.data);
                    console.debug("lookupFactory.html", modal.html());
                    modal.modal("show");
                });

            }

        }

    }]);


function getLookupLoader() {
    return $("<i>").addClass("fa fa-spinner fa-spin");
}

function getModal() {
    var modal = $("<div tabindex='-1' role='dialog'>").addClass("modal fade");
    var dialog = $("<div>").addClass("modal-dialog");
    var content = $("<div>").addClass("modal-content");
    var modalHeader = $("<div>").addClass("modal-header bg-primary");
    var modalBody = $("<div>").addClass("modal-body");
    var closeButton = $("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
    closeButton.html("<span aria-hidden='true'>&times;</span>");
    dialog.appendTo(modal);
    content.appendTo(dialog);
    modalHeader.appendTo(content);
    modalBody.appendTo(content);
    closeButton.appendTo(modalHeader);
    $("<h4>").addClass("modal-title").html("{{label}}").appendTo(modalHeader);

    return modal;
}
;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidSelect", [])
    .directive("fluidSelect", ["$templateCache", "$http", "$compile", "$injector", function (tc, h, c, inj) {
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
                    } else if (attr.factory) {
                        scope.isLoading = true;
                        scope.sourceList = inj.get(attr.factory);
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
                    label.attr("ng-repeat", "item in sourceList | filter : {" + scope.fieldValue + ": model} | limitTo: 1");
                } else {
                    label.attr("ng-repeat", "item in sourceList | filter : model | limitTo: 1");
                }
                label.html(itemLabel);

                c(label)(scope);

                scope.addElements = function () {
                    var listElements = $("<li>").addClass("fluid-select-item").attr("ng-repeat", scope.options).appendTo(dropDown);
                    var item = $("<a>").attr("ng-click", "select(" + itemValue + ",item,$index,$event)").addClass("morris-hover-point").text(itemLabel).appendTo(listElements);
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

                scope.$watch(function () {
                    return attr.factory;
                }, function () {
                    scope.loaded = false;
                });

                scope.select = function (item, full, $index, $event) {
                    scope.model = item;
                    scope.change({item: item, full: full, $index: $index, $event: $event});
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
 * Created by jerico on 9/13/15.
 */
angular.module("fluid.webComponents.fluidSubcomponent", [])
    .directive("fluidSubcomponent", ["fluidSubcomponent", function (fc) {
        var fluidSubcomponent = {
            restrict: "AE",
            replace: true,
            collection: true,
            link: function (scope, element, attr) {
                if (attr.tag) {
                    var subComponent = $(fc.getSubcomponent(attr.tag).htmlTag);
                    $.each(attr.$attr, function (k, v) {
                        if (k === "tag") {
                        } else if (k === "fluidSubcomponent") {
                        } else {
                            subComponent.attr(v, attr[k]);
                        }
                    });
                    element.replaceWith(subComponent[0]);
                    element.addClass("fluid-subcomponent");
                } else {
                    throw "Please define fluid web component tag [tag='']";
                }
            }

        };

        return fluidSubcomponent;
    }]).provider("fluidSubcomponent", function fluidSubcomponentProvider() {
        this.subcomponents = [];

        this.subcomponents["fluid-select"] = {
            htmlTag: "<fluid-select>",
            events: ['change']
        };
        this.subcomponents["fluid-subtable"] = {
            htmlTag: "<fluid-subtable>",
            events: ['validate']
        };

        this.setSubcomponent = function (name, options) {
            this.subcomponents[name] = options;
            return this;
        };

        this.$get = [function () {
            var subcom = new fluidSubcomponentProvider();

            subcom.getSubcomponent = function (name) {
                return subcom.subcomponents[name];
            };

            return subcom;
        }]

    });
;/**
 * Created by Jerico on 10/09/2015.
 */
angular.module("fluid.webComponents.fluidSubTable", [])
    .directive("fluidSubtable", ["$templateCache", "$compile", "lookUp", function (tc, c, lookUp) {

        return {
            restrict: "AE",
            template: tc.get("templates/fluid-subtable.html"),
            transclude: true,
            replace: true,
            scope: {model: "=", validate: "&"},
            link: function (scope, element, attr) {

                scope.columns = [];
                scope.method = "get";
                if (attr.method) {
                    scope.method = attr.method;
                }


                if (!scope.model) {
                    scope.model = [];
                }

                if (attr.sourceUrl) {
                    scope.sourceUrl = attr.sourceUrl;
                }
                if (attr.label) {
                    scope.label = attr.label;
                }
                if (!attr.keyVar) {
                    throw "KeyVar is required.";
                }

                if (attr.factory) {
                    scope.factory = attr.factory;
                }

                scope.selectItemFn = "selectLookUp(" + attr.keyVar + ",$event)";

                var modal = getSubTableModal();

                modal.appendTo(element);

                scope.validate = function (value) {
                    return true;
                };


                console.debug("fluidSubtable.validate", scope.validate);

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
                                scope.model[scope.index] = item;
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
                    } else if (action === "edit") {
                        scope.action = "Edit";
                        scope.index = $index;
                        scope[attr.keyVar] = item;
                        angular.copy(scope.model[scope.index], scope.item);
                    }

                };

                scope.change = function (item, full, $index, $event) {
                    console.debug("fluidSubtable.event", $event);
                    if (item === "Create") {
                        scope.action = item;
                        scope.selectValue = undefined;
                        modal.modal("show");
                    } else if (item === "Search") {
                        lookUp.open({
                            method: scope.method,
                            sourceUrl: scope.sourceUrl,
                            event: $event,
                            label: attr.label
                        });
                    }
                };

                scope.select = function (item) {
                    scope.selectedItem = item;
                }

                scope.selectLookUp = function (item, $event) {
                    if (scope.validate) {
                        if (scope.validate({value: item})) {
                            scope.model.push(item);
                        }
                    } else {
                        scope.model.push(item);
                    }
                }


                scope.delete = function () {
                    scope.model.splice(scope.index, 1);
                    scope.hideModal();
                };


                var transclude = element.find("ng-transclude");

                var grid = $("<fluid-lookup-grid>").attr("key-var", attr.keyVar);
                var gridContainer = $("<div>").addClass("fluid-grid").appendTo(grid);
                if (attr.lookupTemplate) {
                    grid.attr("lookup-template", attr.lookupTemplate);
                }

                transclude.find("fluid-subcolumn").each(function () {
                    var column = JSON.parse($(this).attr("column"));
                    $("<div>").html("{{item." + column.name + "}}").appendTo(gridContainer);
                    scope.columns.push(column);
                });

                console.debug("subTable.sourceUrl", scope.sourceUrl);
                console.debug("subTable.factory", scope.factory);
                var fluidLookup = element.find("button[fluid-lookup]");

                if (scope.sourceUrl || scope.factory) {
                    grid.appendTo(fluidLookup);
                    c(fluidLookup)(scope);
                } else {
                    fluidLookup.addClass("hidden");
                }

                setTable(element, attr.keyVar, c, scope, modal);
                transclude.remove();

            }
        }

    }])
    .directive("fluidSubcolumn", ["$compile", function (c) {

        return {
            restrict: "AE",
            template: "<div ng-transclude></div>",
            link: {
                pre: function (scope, element, attr, controller, transcludeFn) {

                },
                post: function (scope, element, attr) {

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

                    var transclude = element.find("[ng-transclude]");

                    column.row = transclude.find(".column-row").html();

                    var form = transclude.find(".column-form").html();

                    column.form = form;

                    console.debug("fluidSubcolumn.column", column);

                    element.attr("column", JSON.stringify(column));
                }
            },
            transclude: true
        }

    }]);

function setTable(element, keyVar, compile, scope, modal) {

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
}

function getSubTableModal() {
    return $("<div class='modal fade fluid-subtable-form' tabindex='-1' role='dialog'>" +
        "<div class='modal-dialog'>" +
        "<form class='modal-content' role='form'>" +
        "<div class='modal-header'>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button> " +
        "<h4 class='modal-title'>{{label}}</h4> </div> <div class='modal-body'> </div> " +
        "<div class='modal-footer'> <div ng-switch='action'> <button type='submit' class='btn btn-info btn-lg create'>{{action == 'Edit' ? 'Update' :action }} </button> " +
        "<button ng-if=\"action=='Edit'\" type='button' class='btn btn-danger btn-lg' ng-click='delete()'>Delete </button> " +
        "<button type='button' class='btn btn-danger btn-lg' ng-click='hideModal()'>Cancel</button> </div> </div> </form> </div> </div>");
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
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-info");
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
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-warning");
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
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-danger");
                } else if (element.hasClass("fluid-lookup")) {
                    element.find(".modal").find(".modal-header").addClass("bg-danger");
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
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-primary");
                } else if (element.hasClass("fluid-lookup")) {
                    element.find(".modal").find(".modal-header").addClass("bg-primary");
                }
            }
        }
    }]);;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents", ["angular.filter", "fluid.webComponents.fluidSubcomponent", "fluid.webComponents.bootstrap", "fluid.webComponents.fluidCache", "fluid.webComponents.fluidSelect", "fluid.webComponents.fluidSubTable", "fluid.webComponents.fluidLookup", "wcTemplates"])
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
        scope.change = function (item) {
            console.debug("sampleCtrl.change", item);
        }
    }])
    .factory("samples", function () {
        return [{"name": "rer", "label": "wer"}, {"name": "3", "label": "w"}]
    });;angular.module('wcTemplates', ['templates/fluid-select.html', 'templates/fluid-subtable.html']);

angular.module("templates/fluid-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-select.html",
    "<label class=\"control-label fluid-select\">{{label}}<div class=\"btn-group fluid-select-dropdown\"><button class=\"btn btn-lg dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" ng-click=\"look()\" aria-expanded=\"false\"><span class=\"label\"></span> <span ng-if=\"!model\">...</span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"><li ng-if=\"isLoading\"><a>Loading {{label ? label : 'selection'}} <i class=\"fa fa-spinner fa-spin\"></i></a></li></ul></div></label>");
}]);

angular.module("templates/fluid-subtable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-subtable.html",
    "<div class=\"fluid-subtable\"><ng-transclude></ng-transclude><div class=\"panel\"><div class=\"panel-heading\"><div class=\"panel-title\"><span><b>{{label}}</b></span> <span class=\"pull-right\"><button type=\"button\" class=\"btn btn-lg btn-info\" ng-click=\"showModal('create')\"><i class=\"fa fa-plus\"></i></button> <button type=\"button\" class=\"btn btn-lg btn-danger\" ng-click=\"model=[]\"><i class=\"fa fa-eraser\"></i></button> <button source-url=\"{{sourceUrl}}\" fluid-lookup type=\"button\" class=\"btn btn-lg btn-warning\" on-lookup=\"{{selectItemFn}}\" method=\"{{method}}\" label=\"{{label}}\" factory=\"{{factory}}\"><i class=\"fa fa-search\"></i></button></span></div></div><table class=\"panel-body table table-striped table-condensed table-hover\"><thead><th ng-repeat=\"col in columns\">{{col.header}}</th></thead><tbody></tbody></table></div></div>");
}]);
