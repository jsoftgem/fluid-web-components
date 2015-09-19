/**
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
            console.debug("sampleCtrl.change", item);
        }
        scope.onLookUp = function (item, $event) {
            scope.selectedSample = item;
            console.debug("wc.onLookUp", $event)
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
    });