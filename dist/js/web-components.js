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
            0;
            0;
        };
        return this;
    }])
    .factory("fluidCache.injector", ["fluidCache.service", function (fs) {

        return {
            "response": function (response) {
                0;
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
                    0;
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
            link: function (scope, element, attr, ngModel) {
                var method = "get";
                if (attr.method) {
                    method = attr.method;
                }
                0;
                element.unbind("click");

                var bootstrapBrand = getBootstrapBrand(attr);
                0;
                element.bind("click", function (e) {
                    lookUp.open({
                        bootstrapBrand: bootstrapBrand,
                        event: e,
                        ngModel: attr.ngModel,
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
            terminal: true,
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
    }]).directive("fluidLookupTable", ["$templateCache", function (tc) {
        var fluidLookUpGrid = {
            terminal: true,
            restrict: "AE",
            link: function (scope, element, attr) {
                element.addClass("table");
                var table = {};

                if (!attr.keyVar) {
                    throw "KeyVar attribute is required.";
                }

                if (attr.lookupTemplate) {
                    table.html = tc.get(attr.lookupTemplate);
                } else {
                    table.html = element.html();
                }

                table.keyVar = attr.keyVar;
                element.parent().attr("lookup-type", "table");
                element.parent().attr("table", JSON.stringify(table));
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

            var label = options.label;
            var bootstrapBrand = options.bootstrapBrand;
            var source = $(event.currentTarget);
            var modal = getModal(label).attr(bootstrapBrand, "");
            var loader = getLookupLoader();
            var oldHtml = $(event.currentTarget).html();
            var keyVar = "";
            var modalBody = modal.find(".modal-body");
            var ngModel = options.ngModel;
            0;
            if (source.attr("lookup-type") === "grid") {
                var grid = JSON.parse(source.attr("grid"));
                keyVar = grid.keyVar;
                var selectorGrid = $("<div>").attr(options.bootstrapBrand, "").addClass("grid").attr("ng-repeat", grid.keyVar + " in " + grid.keyVar + "_data").appendTo(modalBody);
                selectorGrid.html(grid.html);
                modalBody.delegate("div.grid", "click", function ($event) {
                    if (ngModel) {
                        0;
                        var indexScope = angular.element($event.target).scope();
                        var item = indexScope[grid.keyVar];
                        0;
                        scope[ngModel] = item;
                        t(function () {
                            scope.$apply();
                        })
                    }
                    modal.modal("hide");
                });
                if (source.attr("on-lookup")) {
                    selectorGrid.unbind("click");
                    selectorGrid.attr("ng-click", source.attr("on-lookup"));
                }
            } else if (source.attr("lookup-type") === "table") {
                var table = JSON.parse(source.attr("table"));
                keyVar = table.keyVar;
                var tableBd = $("<table class='modal-body table lookup-table table-hover table-striped table-condensed'>").attr(options.bootstrapBrand, "").appendTo(modalBody);
                tableBd.delegate("tr", "click", function ($event) {
                    if (ngModel) {
                        0;
                        var indexScope = angular.element($event.target).scope();
                        var item = indexScope[table.keyVar];
                        0;
                        scope[ngModel] = item;
                        t(function () {
                            scope.$apply();
                        })
                    }
                    modal.modal("hide");
                });
                var thead = $("<thead>").appendTo(tableBd);
                var tr = $("<tr>").attr("ng-repeat", table.keyVar + " in " + table.keyVar + "_data").appendTo(tableBd);
                $(table.html).each(function () {
                    var col = $(this)
                    if (col.hasClass("column-row")) {
                        var header = col.attr("header");
                        $("<th>").html(header).appendTo(thead);
                        $("<td>").html(col.html()).appendTo(tr);
                    }
                    0;
                });
                modalBody.replaceWith(tableBd);
            }

            0;
            c(modal.contents())(scope);

            if (sourceUrl) {
                $(event.currentTarget).html(loader);
                h({
                    method: method,
                    url: sourceUrl
                }).success(function (data) {
                    $(event.currentTarget).html(oldHtml);
                    scope[keyVar + "_data"] = data;
                    t(function () {
                        scope.$apply();
                    });
                    modal.modal("show");
                });
            } else if (factory) {
                t(function () {
                    scope[keyVar + "_data"] = inj.get(factory);
                    t(function () {
                        scope.$apply();
                    });
                    0;
                    0;
                    modal.modal("show");
                });

            }

        }

    }]);


function getLookupLoader() {
    return $("<i>").addClass("fa fa-spinner fa-spin");
}

function getModal(label) {
    var modal = $("<div tabindex='-1' role='dialog'>").addClass("modal fade fluid-lookup");
    var dialog = $("<div>").addClass("modal-dialog");
    var content = $("<div>").addClass("modal-content");
    var modalHeader = $("<div>").addClass("modal-header");
    var modalBody = $("<div>").addClass("modal-body");
    var closeButton = $("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
    closeButton.html("<span aria-hidden='true'>&times;</span>");
    dialog.appendTo(modal);
    content.appendTo(dialog);
    modalHeader.appendTo(content);
    modalBody.appendTo(content);
    closeButton.appendTo(modalHeader);
    $("<h4>").addClass("modal-title").html("<b>" + label + "</b>").appendTo(modalHeader);

    return modal;
}
;/**
 * Created by jerico on 9/18/15.
 */
angular.module("fluid.webComponents.fluidPagination", [])
    .directive("fluidPagination", [function () {

    }]);;/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.fluidSelect", [])
    .directive("fluidSelect", ["$templateCache", "$http", "$compile", "$injector", "$timeout", "$filter", "$q", function (tc, h, c, inj, t, f, q) {
        return {
            require: "ngModel",
            restrict: "AE",
            template: tc.get("templates/fluid-select.html"),
            link: function (scope, element, attr, ngModel) {
                0;
                0;
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

                if (attr.fieldLabel) {
                    fieldValue = attr.fieldLabel;
                }

                var dropDown = element.find("ul.dropdown-menu");

                var loader = $("<li><a>Loading " + (attr.label ? attr.label : "selection") + " <i class='fa fa-spinner fa-spin'></i></a> </li>");

                var label = element.find("span.label");

                var lookupButton = element.find("button.look");

                lookupButton.click(function ($event) {
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
                        a.click(function ($event) {
                            0;
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
                                var value = new getValue(itemLabel[0], fieldValue).value;
                                label.text(value);
                            });
                        } else {
                            var itemLabel = f("filter")(sourceList, dataValue);
                            var value = new getValue(itemLabel[0], fieldValue).value;
                            label.text(value);
                        }
                    } else {
                        label.text("");
                    }
                }

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
;/**
 * Created by jerico on 9/13/15.
 */
angular.module("fluid.webComponents.fluidSubcomponent", [])
    .directive("fluidSubcomponent", ["fluidSubcomponent", function (fc) {
        var fluidSubcomponent = {
            restrict: "AE",
            terminal: true,
            compile: function (elem, attrs) {
                var link = function (scope, element, attr) {
                    if (attr.tag) {
                        var subComponent = $(fc.getSubcomponent(attr.tag).htmlTag);
                        $.each(attr.$attr, function (k, v) {
                            if (k === "tag") {
                            } else if (k === "fluidSubcomponent") {
                            } else {
                                subComponent.attr(v, attr[k]);
                            }
                        });
                        subComponent.html(element.html());
                        element.replaceWith(subComponent);
                    } else {
                        throw "Please define fluid web component tag [tag='']";
                    }
                }

                return link;
            }
        };

        return fluidSubcomponent;
    }]).provider("fluidSubcomponent", function fluidSubcomponentProvider() {
        this.subcomponents = [];

        this.subcomponents["fluid-select"] = {
            htmlTag: "<fluid-select>"
        };
        this.subcomponents["fluid-subtable"] = {
            htmlTag: "<fluid-subtable>"
        };
        this.subcomponents["fluid-subcolumn"] = {
            htmlTag: "<fluid-subcolumn>"
        };
        this.subcomponents["li"] = {
            htmlTag: "<li>"
        };
        this.subcomponents["div"] = {
            htmlTag: "<div>"
        };
        this.subcomponents["tr"] = {
            htmlTag: "<tr>"
        };
        this.subcomponents["th"] = {
            htmlTag: "<th>"
        };
        this.subcomponents["td"] = {
            htmlTag: "<td>"
        };
        this.subcomponents["ul"] = {
            htmlTag: "<ul>"
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
    .directive("fluidSubtable", ["$templateCache", "$compile", "$timeout", "$filter", "fluidClient", function (tc, c, t, f, fc) {

        var keyVar = undefined;

        return {
            restrict: "AE",
            require: "ngModel",
            template: tc.get("templates/fluid-subtable.html"),
            transclude: true,
            link: {
                pre: function (scope, element, attr) {

                    var loaded = attr.tableLoaded;
                    if (!loaded) {
                        var fluidLookupButton = element.find("button[fluid-lookup]");
                        if (attr.sourceUrl) {
                            fluidLookupButton.attr("source-url", attr.sourceUrl);
                        }

                        if (attr.factory) {
                            fluidLookupButton.attr("factory", attr.factory);
                        }

                        if (attr.label) {
                            element.find(".fst-label").html(attr.label);
                            fluidLookupButton.attr("label", attr.label);
                        }

                        if (attr.method) {
                            fluidLookupButton.attr("method", method);
                        }

                        if (!attr.keyVar) {
                            throw "key-var attribute is required."
                        }
                        keyVar = fc.getKeyVar(attr.keyVar);

                        var bootstrapBrand = getBootstrapBrand(attr);
                        fluidLookupButton.attr("ng-model", keyVar + "_lookup").attr(bootstrapBrand, "");
                        scope[keyVar + "_lookup"] = undefined;
                        t(function () {
                            scope.$apply();
                        });
                        c(fluidLookupButton)(scope);
                    }
                },
                post: function (scope, element, attr, ngModel) {
                    var loaded = attr.tableLoaded;
                    var columns = [];
                    var fluidLookupButton = element.find("button[fluid-lookup]");
                    var transclude = element.find("ng-transclude");
                    var validate = "true";
                    var grid = $("<fluid-lookup-grid>").attr("key-var", "gridItem");
                    var gridContainer = $("<div>").addClass("fluid-grid").appendTo(grid);
                    var bootstrapBrand = getBootstrapBrand(attr);

                    if (!loaded) {

                        if (!scope[attr.ngModel]) {
                            scope[attr.ngModel] = [];
                            t(function () {
                                scope.$apply();
                            })
                        }

                        if (attr.lookupTemplate) {
                            grid.attr("lookup-template", attr.lookupTemplate);
                        }

                        if (attr.validate) {
                            validate = attr.validate;
                        }


                        if (attr.removeAll) {
                            var removeAll = scope.$eval(attr.removeAll);
                            if (removeAll !== undefined && removeAll === false) {
                                var eraseButton = element.find("button.delete");
                                eraseButton.remove();
                            }
                        }

                        for (var index = 0; index < transclude.children().length; index++) {
                            var subColumn = $(transclude.children()[index]);
                            if (subColumn.is("fluid-subcolumn")) {
                                var column = JSON.parse(subColumn.attr("column"));
                                $("<div>").html("{{gridItem." + column.name + "}}").appendTo(gridContainer);
                                columns.push(column);
                            }
                        }

                        if (attr.sourceUrl || attr.factory) {
                            grid.appendTo(fluidLookupButton);
                            c(fluidLookupButton)(scope);
                        } else {
                            fluidLookupButton.addClass("hidden");
                        }

                        0;
                        var modal = getSubTableModal(attr.label);
                        modal.$modal.attr(bootstrapBrand, "");
                        setTable(element, keyVar, c, scope, modal, attr.ngModel, ngModel, t, columns, validate, f);
                        transclude.remove();
                    }

                }

            }
        }

    }])
    .directive("fluidSubcolumn", ["$compile", function (c) {

        return {
            restrict: "AE",
            template: "<div ng-transclude></div>",
            link: {
                pre: function (scope, element, attr, controller, transcludeFn) {
                    0;
                },
                post: function (scope, element, attr) {
                    var column = {filter: true};
                    if (attr.name) {
                        column.name = attr.name;
                    } else {
                        throw "Name attribute is required.";
                    }

                    if (attr.header) {
                        column.header = attr.header;
                    }

                    if (attr.filter) {
                        column.filter = scope.$eval(attr.filter);
                    }

                    if (attr.toggleColumns) {
                        column.toggleColumns = scope.$eval(attr.toggleColumns);
                    }

                    if (attr.value) {
                        column.value = attr.value;
                    }
                    var transclude = element.find("[ng-transclude]").first();
                    column.row = transclude.find(".column-row").html();
                    var form = transclude.find(".column-form").html();
                    column.form = form;
                    0;
                    element.attr("column", JSON.stringify(column));
                    transclude.remove();
                }
            },
            transclude: true
        }

    }]);

function setTable(element, keyVar, compile, scope, modal, value, ngModel, timeout, columns, validate, $filter) {


    var createButton = element.find("button.create");
    var eraseButton = element.find("button.delete");
    var sort = undefined;
    var fieldSorted = undefined;
    var modeloc = keyVar + "_oc";
    var keyVarLookup = keyVar + "_lookup";

    var addItem = function (item) {
        var sortedArray = ngModel.$viewValue;
        sortedArray.push(item);
        if (sort) {
            sortedArray = $filter("orderBy")(sortedArray, fieldSorted, sort === "desc");
        }
        if (scope[modeloc]) {
            scope[modeloc].push(item);
        }
        ngModel.$setViewValue(sortedArray);
        timeout(function () {
            scope.$apply();
        });
    };


    var updateItem = function (item, index) {
        var sortedArray = ngModel.$viewValue;
        sortedArray[index] = item;
        if (sort) {
            sortedArray = $filter("orderBy")(ngModel.$viewValue, fieldSorted, sort === "desc");
        }
        if (scope[modeloc]) {
            scope[modeloc][index] = item;
        }
        ngModel.$setViewValue(sortedArray);
        timeout(function () {
            scope.$apply();
        });
    };


    var removeItem = function (index) {
        ngModel.$viewValue.splice(index, 1);
        if (scope[modeloc]) {
            scope[modeloc].splice(index, 1);
        }
        timeout(function () {
            scope.$apply();
        });
    };

    scope.$watch(function () {
        return scope[keyVarLookup];
    }, function (lookupModel) {
        if (lookupModel) {
            addItem(lookupModel);
            scope[keyVarLookup] = undefined;
            timeout(function () {
                scope.$apply();
            });
        }
    });

    ngModel.$render = function () {
        if (!ngModel.$viewValue) {
            ngModel.$setViewValue([]);
            timeout(function () {
                scope.$apply();
            })
        }
    };

    var mode = {
        create: function () {
            modal.actionButton.addClass("action-create");
            modal.actionButton.removeClass("action-edit");
            modal.deleteButton.addClass("hidden");
        },
        edit: function () {
            modal.actionButton.removeClass("action-create");
            modal.actionButton.addClass("action-edit");
            modal.deleteButton.removeClass("hidden");

        }
    };

    createButton.unbind("click");
    createButton.click(function () {
        modal.$modal.modal("show");
        modal.actionButton.text("Create");
        mode.create();
        scope[keyVar] = {};
        timeout(function () {
            scope.$apply();
        });
    });

    eraseButton.unbind("click");
    eraseButton.click(function () {
        ngModel.$setViewValue([]);
        timeout(function () {
            scope.$apply();
        });
    });


    modal.cancelButton.unbind("click");
    modal.cancelButton.click(function () {
        modal.$modal.modal("hide");
    });

    modal.actionButton.unbind("click");
    modal.actionButton.click(function () {
        if (modal.actionButton.hasClass("action-create")) {
            if (scope[keyVar]) {
                if (scope.$eval(validate))
                    if (!ngModel.$viewValue) ngModel.$setViewValue([]);
                addItem(scope[keyVar]);
                modal.$modal.modal("hide");
            }
        }
        else if (modal.actionButton.hasClass("action-edit")) {
            if (scope[keyVar]) {
                var $index = modal.actionButton.attr("index");
                if (scope.$eval(validate)) {
                    updateItem(scope[keyVar], $index);
                    modal.$modal.modal("hide");
                }
            }
        }
    });

    modal.deleteButton.unbind("click");
    modal.deleteButton.click(function () {
        var $index = modal.deleteButton.attr("index");
        removeItem($index);
        modal.$modal.modal("hide");
        0;
    });

    var table = element.find("table");
    table.addClass(keyVar);
    var thead = table.find("thead");
    var tr = $("<tr>").attr("ng-repeat", keyVar + " in " + value + " track by $index");

    element.find("table." + keyVar).delegate("tr td", "click", function ($event) {
        0;
        var eventScope = angular.element($event.target).scope();
        0;
        modal.actionButton.text("Update");
        modal.actionButton.attr("index", eventScope.$index);
        modal.deleteButton.attr("index", eventScope.$index);
        mode.edit();
        var copy = {};
        angular.copy(ngModel.$viewValue[eventScope.$index], copy);
        scope[keyVar] = copy;
        timeout(function () {
            scope.$apply();
        });
        modal.$modal.modal("show");
    });


    thead.delegate("th", "click", function () {
        var sorter = $(this).find("a.fluid-sort");
        sort = sorter.attr("sort");
        fieldSorted = $(this).attr("field-name");
        var sorting = thead.attr("sorting");
        if (sorting !== fieldSorted) {
            thead.find("th[field-name='" + sorting + "']")
                .removeAttr("sort");
            thead.find("th[field-name='" + sorting + "'] a")
                .removeClass("fa-sort-desc")
                .removeClass("fa-sort-asc");
        }


        0;
        if (sort === undefined) {
            scope[keyVar + "_oc"] = ngModel.$viewValue;
            sorter.toggleClass("fa fa-sort-desc");
            sorter.attr("sort", "asc");
            sort = "asc";
        } else if (sort === "asc") {
            sorter.toggleClass("fa fa-sort-asc");
            sorter.toggleClass("fa fa-sort-desc");
            sorter.attr("sort", "desc");
            sort = "desc";
        } else if (sort === "desc") {
            sorter.removeClass("fa fa-sort-desc");
            sorter.removeClass("fa fa-sort-asc");
            sorter.removeAttr("sort");
            sort = undefined;
        }

        thead.attr("sorting", fieldSorted);

        var sorted = undefined;
        if (sort === "asc") {
            sorted = false;
        } else if (sort === "desc") {
            sorted = true;
        }
        0;

        var sortedArray = undefined;

        if (sorted !== undefined) {
            sortedArray = $filter("orderBy")(ngModel.$viewValue, fieldSorted, sorted);
            sortedArray.sort = sort;
        } else {
            sortedArray = scope[modeloc];
            0;
        }

        ngModel.$setViewValue(sortedArray);

        timeout(function () {
            scope.$apply();
        });


    });

    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        var td = $("<td>");
        if (/<[a-z][\s\S]*>/i.test(col.row)) {
            $(col.row).appendTo(td);
        } else {
            td.html(col.row);
        }
        var th = $("<th>").html(col.header).appendTo(thead);
        th.attr("field-name", col.name);
        $("<a href='#'>").appendTo(th).addClass("fluid-sort");
        td.appendTo(tr);
        $(col.form).appendTo(modal.body);
        0;
        0;

    }

    tr.appendTo(table);
    compile(table)(scope);
    timeout(function () {
        scope.$apply();
    });
    0;
    compile(modal.$modal.contents())(scope);
    element.attr("table-loaded", true);
}

function getSubTableModal(label) {

    var $modal = $("<div class='modal fade fluid-subtable fluid-subtable-form' tabindex='-1' role='dialog'>");
    var $dialog = $("<div class='modal-dialog'>").appendTo($modal);
    var $modalContent = $("<form class='modal-content' role='form'>").appendTo($dialog);
    var $modalHeader = $("<div class='modal-header'>").appendTo($modalContent);
    $("<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>").appendTo($modalHeader);
    $("<h4 class='modal-title'><b>" + label + "</b></h4>").appendTo($modalHeader);
    var $modalBody = $("<div class='modal-body container-fluid'>").appendTo($modalContent);
    var $modalFooter = $("<div class='modal-footer'>").appendTo($modalContent);
    var $actionButton = $("<button type='submit' info class='btn btn-lg'>").appendTo($modalFooter);
    var $deleteButton = $("<button type='button' danger class='btn btn-lg'>").html("Delete").appendTo($modalFooter);
    var $cancelButton = $("<button type='button' danger class='btn btn-lg'>").html("Cancel").appendTo($modalFooter);

    return {
        $modal: $modal,
        content: $modalContent,
        body: $modalBody,
        actionButton: $actionButton,
        cancelButton: $cancelButton,
        deleteButton: $deleteButton
    }

};/**
 * Created by jerico on 9/16/15.
 */
function getValue(object, field) {
    if (field) {
        for (var item in object) {
            if (item === field) {
                this.value = object[item];
                break;
            }
        }

    } else {
        this.value = object;
    }
    return this;
}

/**
 * Checks the bootstrap brand attribute (primary,info,warning,success,danger) if exists
 * returns their String value if true
 * @param attr
 */
function getBootstrapBrand(attr) {

    var bootstrapBrand = "";

    if (attr.primary !== undefined) {
        bootstrapBrand = "primary";
    }

    if (attr.info !== undefined) {
        bootstrapBrand = "info";
    }

    if (attr.success !== undefined) {
        bootstrapBrand = "success";
    }

    if (attr.warning !== undefined) {
        bootstrapBrand = "warning";
    }

    if (attr.danger !== undefined) {
        bootstrapBrand = "danger";
    }


    return bootstrapBrand;

};/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents.bootstrap", [])
    .directive("info", [function () {
        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.is("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-info");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-info");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-info");
                } else if (element.is("fluid-subtable")) {
                    element.find(".panel").addClass("panel-info");
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-info");
                } else if (element.hasClass("modal")) {
                    element.find("modal-header").addClass("bg-info");
                } else if (element.is("table")) {

                }

            }
        }
    }]).directive("warning", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.is("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-warning");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-warning");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-warning");
                } else if (element.is("fluid-subtable")) {
                    element.find(".panel").addClass("panel-warning");
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-warning");
                } else if (element.hasClass("modal")) {
                    element.find("modal-header").addClass("bg-warning");
                }
            }
        }
    }]).directive("danger", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.is("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-danger");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-danger");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-danger");
                } else if (element.is("fluid-subtable")) {
                    element.find(".panel").addClass("panel-danger");
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-danger");
                } else if (element.hasClass("fluid-lookup")) {
                    element.find(".modal").find(".modal-header").addClass("bg-danger");
                } else if (element.hasClass("modal")) {
                    element.find("modal-header").addClass("bg-danger");
                }
            }
        }
    }]).directive("success", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.is("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-success");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-success");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-success");
                } else if (element.is("fluid-subtable")) {
                    element.find(".panel").addClass("panel-success");
                } else if (element.hasClass("modal")) {
                    element.find("modal-header").addClass("bg-success");
                }
            }
        }
    }]).directive("primary", [function () {

        return {
            restrict: "A",
            link: function (scope, element) {
                if (element.is("fluid-select")) {
                    element.find(".dropdown-toggle").addClass("btn-primary");
                } else if (element.hasClass("btn")) {
                    element.addClass("btn-primary");
                } else if (element.hasClass("panel")) {
                    element.addClass("panel-primary");
                } else if (element.is("fluid-subtable")) {
                    element.find(".panel").addClass("panel-primary");
                    element.find(".modal.fluid-subtable-form").find(".modal-header").addClass("bg-primary");
                } else if (element.hasClass("fluid-lookup")) {
                    element.find(".modal").find(".modal-header").addClass("bg-primary");
                } else if (element.hasClass("modal")) {
                    element.find("modal-header").addClass("bg-primary");
                    0;
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
        scope.year = 1957;
        scope.sample = "rer";
        scope.change = function (item) {
            0;
        }
        scope.onLookUp = function (item, $event) {
            scope.selectedSample = item;
            0
        }
    }])
    .service("fluidClient", [function () {

        this.getKeyVar = function (keyVar) {
            if (!this.keyVars) {
                this.keyVars = [];
            }
            if (this.keyVars[keyVar] != null) {
                var keys = this.keyVars[keyVar];
                keys++;
                this.keyVars[keyVar] = keys;
                return keyVar + "_" + keys;
            } else {
                this.keyVars[keyVar] = 0;
                return keyVar;
            }
        };

        return this;
    }])
    .factory("samples", function () {

        return [{
            "name": "Jerico",
            year: 1991,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Pogi",
            year: 1991,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "John Doe",
            year: 1978,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "James Hitler",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Anita",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Calcium Kid",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}, {"name": "Someone Else", "year": "1976"}]
        }];
    });;angular.module('wcTemplates', ['templates/fluid-select.html', 'templates/fluid-subtable.html']);

angular.module("templates/fluid-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-select.html",
    "<label class=\"control-label fluid-select\"><span class=\"fwc-label\"></span><div class=\"btn-group fluid-select-dropdown\"><button class=\"btn btn-lg dropdown-toggle look\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"><span class=\"label\"></span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"></ul></div></label>");
}]);

angular.module("templates/fluid-subtable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid-subtable.html",
    "<div class=\"fluid-subtable\"><ng-transclude></ng-transclude><div class=\"panel\"><div class=\"panel-heading\"><div class=\"panel-title fluid-table-panel-title\"><span><b class=\"fst-label\"></b></span> <span class=\"pull-right\"><button type=\"button\" class=\"btn btn-lg btn-info create\"><i class=\"fa fa-plus\"></i></button> <button type=\"button\" class=\"btn btn-lg btn-danger delete\"><i class=\"fa fa-eraser\"></i></button> <button fluid-lookup type=\"button\" class=\"btn btn-lg btn-warning\"><i class=\"fa fa-search\"></i></button></span></div></div><table class=\"panel-body table table-striped table-condensed table-hover\"><thead></thead><tbody></tbody></table></div></div>");
}]);
