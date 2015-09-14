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
