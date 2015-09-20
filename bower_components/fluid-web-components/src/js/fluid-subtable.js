/**
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
                        fluidLookupButton.attr("title", "Look " + (attr.label ? "for " + attr.label : "up"));


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


                        if (attr.showClear) {
                            var showClear = scope.$eval(attr.showClear);
                            if (showClear !== undefined && showClear === false) {
                                var eraseButton = element.find("button.delete");
                                eraseButton.remove();
                            }
                        } else {
                            var eraseButton = element.find("button.delete");
                            eraseButton.attr("title", "Clear " + (attr.label ? attr.label : ""));
                        }

                        if (attr.showAdd) {
                            var showAdd = scope.$eval(attr.showAdd);
                            if (showAdd !== undefined && showAdd === false) {
                                var createButton = element.find("button.create");
                                createButton.remove();
                            }
                        } else {
                            var createButton = element.find("button.create");
                            createButton.attr("title", "add " + (attr.label ? attr.label : ""));
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

                        console.debug("fluidSubtable.columns", columns);
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
            terminal: true,
            link: {
                pre: function (scope, element, attr, controller, transcludeFn) {
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


                    if (attr.sort) {
                        column.sort = scope.$eval(attr.sort);
                    }

                    console.debug("fluidSubcolumn.element", element[0]);
                    column.row = element.find(".column-row").html();
                    var form = element.find(".column-form").html();
                    column.form = form;
                    console.debug("fluidSubcolumn.column", column);
                    element.attr("column", JSON.stringify(column));
                    element.html("");
                }
            }
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
        console.debug("$index", $index);
    });

    var table = element.find("table");
    table.addClass(keyVar);
    var thead = table.find("thead");
    var tr = $("<tr>").attr("ng-repeat", keyVar + " in " + value + " track by $index");

    element.find("table." + keyVar).delegate("tr td", "click", function ($event) {
        console.debug("fluidSubtable.tr", $(this));
        var eventScope = angular.element($event.target).scope();
        console.debug("fluidSubtable.eventScope.edit", eventScope);
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


    thead.delegate("th.fluid-sort", "click", function () {
        var sorter = $(this).find("a");
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


        console.debug("fluid-subtable.sorted", sort);
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
        console.debug("fluid-subtable.sorted", sorted);

        var sortedArray = [];

        if (sorted !== undefined) {
            sortedArray = $filter("orderBy")(ngModel.$viewValue, fieldSorted, sorted);
            sortedArray.sort = sort;
        } else {
            angular.copy(scope[modeloc], sortedArray);
            console.debug("fluid-subtable.sortedArray_oc", sortedArray);
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
        if (col.sort !== false) {
            th.addClass("fluid-sort");
        }
        $("<a href='#'>").appendTo(th);
        td.appendTo(tr);
        $(col.form).appendTo(modal.body);
        console.debug("subColumn.col.form", col.form);
        console.debug("subColumn.createdTd", td);

    }

    tr.appendTo(table);
    compile(table)(scope);
    timeout(function () {
        scope.$apply();
    });
    console.debug("fluid-subtable.modal.contents", modal.$modal[0]);
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

}