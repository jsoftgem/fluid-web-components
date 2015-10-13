/**
 * Created by Jerico on 02/10/2015.
 */
angular.module("fluid.utils", [])
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
        var fluidAsyncIterator = function (url, method) {

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
                }).error(function (err) {
                    q.reject(err);
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
        return fluidAsyncIterator;
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