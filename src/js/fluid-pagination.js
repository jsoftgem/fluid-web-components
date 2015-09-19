/**
 * TODO: fluid-pagination creates size limit to specified ng-model and creates pagination.
 * Created by jerico on 9/18/15.
 */
angular.module("fluid.webComponents.fluidPagination", [])
    .directive("fluidPagination", ["$compile", "$timeout", "$resource", function (c, t, r) {


        var preFluidPaginationLink = function (scope, element, attr, ngModel) {
            c(element.contents())(scope);

            if (!attr.sourceUrl) {
                throw "attribute source-url is required.";
            }
        };

        var postFluidPaginationLink = function (scope, element, attr, ngModel) {
        };


        var paginator = function (element, attr) {

            var sourceUrl = attr.sourceUrl;

            var method = attr.method;

            var resource = r(sourceUrl);

        };

        var fluidPagination = {
            restrict: "AE",
            terminal: true,
            require: "ngModel",
            link: {
                pre: preFluidPaginationLink,
                post: postFluidPaginationLink
            }

        };


        return fluidPagination;

    }]);

