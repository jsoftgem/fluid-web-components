/**
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
                    var subComponent = $(fc.getSubcomponent(attr.tag));
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
    }])
    .service("fluidSubcomponent", [function () {
        this.subcomponents = [];
        this.subcomponents["fluid-select"] = "<fluid-select>";
        this.addSubcomponent = function (name, tag) {
            this.subcomponents[name] = tag;
        }
        this.getSubcomponent = function (name) {
            return this.subcomponents[name];
        }
        return this;
    }]);
