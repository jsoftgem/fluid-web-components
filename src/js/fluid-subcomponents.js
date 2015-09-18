/**
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
