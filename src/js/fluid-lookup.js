/**
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
                console.debug("fluid-lookup.ngModel", ngModel);
                element.unbind("click");

                var bootstrapBrand = getBootstrapBrand(attr);
                console.debug("fluidLookup.bootstrapBrand.before", bootstrapBrand);
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
            console.debug("fluidLookup.bootstrapBrand", bootstrapBrand);
            if (source.attr("lookup-type") === "grid") {
                var grid = JSON.parse(source.attr("grid"));
                keyVar = grid.keyVar;
                var tempSearchDiv = $("<div class='form-group'>").appendTo(modalBody);
                modalBody.attr("ng-init", keyVar + "_search=undefined");
                $("<input class='form-control'>").attr("ng-model", keyVar + "_search").attr("placeholder", "Search " + label.toLowerCase())
                    .appendTo(tempSearchDiv);
                var selectorGrid = $("<div>").attr(options.bootstrapBrand, "").addClass("grid").attr("ng-repeat", grid.keyVar + " in " + grid.keyVar + "_data | filter: " + keyVar + "_search").appendTo(modalBody);
                selectorGrid.html(grid.html);
                modalBody.delegate("div.grid", "click", function ($event) {
                    if (ngModel) {
                        console.debug("fluid-lookup.ngModel", ngModel);
                        var indexScope = angular.element($event.target).scope();
                        var item = indexScope[grid.keyVar];
                        console.debug("fluid-lookup.selectedItem", item);
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
                        console.debug("fluid-lookup.ngModel", ngModel);
                        var indexScope = angular.element($event.target).scope();
                        var item = indexScope[table.keyVar];
                        console.debug("fluid-lookup.selectedItem", item);
                        scope[ngModel] = item;
                        t(function () {
                            scope.$apply();
                        })
                    }
                    modal.modal("hide");
                });
                var thead = $("<thead>").appendTo(tableBd);
                var tr = $("<tr>").attr("ng-repeat", table.keyVar + " in " + table.keyVar + "_data | filter: " + keyVar + "_search").appendTo(tableBd);
                $(table.html).each(function () {
                    var col = $(this)
                    if (col.hasClass("column-row")) {
                        var header = col.attr("header");
                        $("<th>").html(header).appendTo(thead);
                        $("<td>").html(col.html()).appendTo(tr);
                    }
                    console.debug("fluid-select.table.col", col);
                });

                var tempSearchDiv = $("<div class='form-group'>").appendTo(modalBody);
                modalBody.attr("ng-init", keyVar + "_search=undefined");
                $("<input class='form-control'>").attr("ng-model", keyVar + "_search").attr("placeholder", "Search " + label.toLowerCase())
                    .appendTo(tempSearchDiv);

                tableBd.appendTo(modalBody);
            }

            console.debug("lookupFactory.modalBody", modalBody.html());
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
