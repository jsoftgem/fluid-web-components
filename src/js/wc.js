/**
 * Created by rickzx98 on 9/5/15.
 */
angular.module("fluid.webComponents", ["angular.filter", "fluid.webComponents.fluidSubcomponent", "fluid.webComponents.bootstrap", "fluid.webComponents.fluidCache", "fluid.webComponents.fluidSelect", "fluid.webComponents.fluidSubTable", "fluid.webComponents.fluidLookup", "fluid.webComponents.fluidPagination", "wcTemplates"])
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
    .controller("sampleCtrl", ["$scope", "FluidAsyncIterator", function (scope, FluidAsyncIterator) {
        scope.taskSize = 5;
        scope.year = 1957;
        scope.sample = "rer";
        scope.change = function (item) {
            console.debug("sampleCtrl.change", item);
        }
        scope.onLookUp = function (item, $event) {
            scope.selectedSample = item;
            console.debug("wc.onLookUp", $event)
        }


        var iterator = new FluidAsyncIterator("http://localhost:9080/rex-services/services/flow_task_query/sample_tasks");
        iterator.setEndCallbackOnly(true);
        iterator.next(function (value, index, proceed) {
            console.debug("iterator-value", value);
            console.debug("iterator-index", index);
            proceed();
        });


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
    .factory("FluidIterator", ["$timeout", "$q", function (t, $q) {

        var fluidIterator = function (values) {
            var endOnly = false;
            var q = $q.defer();
            var array = values;
            var length = array.length;
            var index = 0;

            function hasNext() {
                return index < length;
            }

            function traverse(nextCallback) {
                var value = undefined;
                if (index < array.length) {
                    value = array[index];
                } else {
                    index--;
                }

                nextCallback(value, index,
                    function (timeout) {
                        index++;
                        if (hasNext()) {
                            t(function () {
                                traverse(nextCallback);
                            }, timeout);
                        } else {
                            if (!endOnly) {
                                index--;
                                q.resolve({index: index, data: array[index]});
                            } else {
                                t(function () {
                                    traverse(nextCallback);
                                }, timeout);
                            }
                        }
                    }, function (data) {
                        q.resolve({index: index, data: data ? data : array[index]});
                    });

            }

            function next(nextCallback) {
                try {
                    traverse(nextCallback);
                } catch (err) {
                    q.reject(err);
                }
                return q.promise;
            }

            function setEndCallbackOnly(end) {
                endOnly = end;
            }

            return {
                next: next, length: length, setEndCallbackOnly: setEndCallbackOnly
            };
        };

        return fluidIterator;
    }])
    .factory("FluidAsyncIterator", ["$http", "$q", "$timeout", function ($h, $q, $t) {

        var fluidAsycnIterator = function (url, method) {

            var endOnly = false;
            var q = $q.defer();
            var length = 0;
            var index = 0;
            var method = method ? method : "GET";


            function hasNext() {
                return index < length;
            }


            function query() {
                return $h({
                    url: url, method: method, params: {index: index}
                });
            }

            function traverse(nextCallback) {
                var value = undefined;

                query().success(function (data) {
                    length = data.length;
                    if (index < length) {
                        value = data.value;
                    } else {
                        index--;
                    }

                    nextCallback(value, index,
                        function (timeout) {
                            index++;
                            if (hasNext()) {
                                $t(function () {
                                    traverse(nextCallback);
                                }, timeout);
                            } else {
                                if (!endOnly) {
                                    index--;
                                    q.resolve({index: index, data: value});
                                } else {
                                    $t(function () {
                                        traverse(nextCallback);
                                    }, timeout);
                                }
                            }
                        }, function (data) {
                            q.resolve({index: index, data: data ? data : value});
                        });
                });
            }

            function next(nextCallback) {
                try {
                    traverse(nextCallback);
                } catch (err) {
                    q.reject(err);
                }
                return q.promise;
            }

            function setEndCallbackOnly(end) {
                endOnly = end;
            }

            return {
                next: next, length: length, setEndCallbackOnly: setEndCallbackOnly
            };

        };


        return fluidAsycnIterator;
    }])
    .factory("samples", function () {

        return [{
            "name": "Jerico",
            year: 1991,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Pogi",
            year: 1991,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "John Doe",
            year: 1978,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "James Hitler",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Anita",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }, {
            "name": "Calcium Kid",
            year: 1998,
            list: [{"name": "Someone Else", "year": "1976"}, {
                "name": "Someone Else",
                "year": "1976"
            }, {"name": "Someone Else", "year": "1976"}]
        }];
    });