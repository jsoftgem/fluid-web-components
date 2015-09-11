/**
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
                        sourceUrl: attr.sourceUrl,
                        label: attr.label
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
    .service("lookUp", ["$compile", "$http", function (c, h) {

        this.open = function (options) {

            var event = options.event;
            var method = options.method;
            var sourceUrl = options.sourceUrl;

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
                var selectorGrid = $("<div>").addClass("grid").attr("ng-repeat", grid.keyVar + " in data").appendTo(modalBody).html(grid.html);
                if (source.attr("on-lookup")) {
                    selectorGrid.attr("ng-click", source.attr("on-lookup"));
                }
            } else {
                //TODO: table
            }

            c(modal)(scope);
            $(event.currentTarget).html(loader);
            h({
                method: method,
                url: sourceUrl
            }).success(function (data) {
                $(event.currentTarget).html(oldHtml);
                scope.data = data;
                modal.modal("show");
            });
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
