/**
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


                scope.selectItemFn = "selectLookUp(" + attr.keyVar + ",$event)";

                var modal = getSubTableModal();

                modal.appendTo(element);
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


                if (scope.sourceUrl) {
                    var fluidLookup = element.find("button[fluid-lookup]");
                    grid.appendTo(fluidLookup);
                    c(fluidLookup)(scope);
                }

                setTable(element, attr.keyVar, c, scope, modal);
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
}