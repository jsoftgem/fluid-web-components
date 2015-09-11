/**
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
    }]);