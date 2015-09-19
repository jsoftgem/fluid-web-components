/**
 * TODO: fluid-pagination creates size limit to specified ng-model and creates pagination.
 *
 * request could have the following properties:
 *  start,limit, sort,field
 *
 * response should consist of the following properties:
 * length (full data count), data
 *
 * Created by jerico on 9/18/15.
 */
angular.module("fluid.webComponents.fluidPagination", [])
    .directive("fluidPagination", ["$compile", "$timeout", "Paginate", function (c, t, Paginate) {

        var pagination = function () {
            var nav = $("<nav>");
            var ul = $("<ul class='pagination pagination-lg'>").appendTo(nav);
            var previousLi = $("<li>").prependTo(ul);
            var previousLink = $("<a aria-label='Previous'><span aria-hidden='true'>&laquo;</span></a>").appendTo(previousLi);
            var nextLi = $("<li>");
            var nextLink = $("<a aria-label='Next'><span aria-hidden='true'>&raquo;</span></a>").appendTo(nextLi);
            return {
                $pagination: nav,
                ul: ul,
                previous: previousLink,
                next: nextLink
            }
        };


        var paginator = function (scope, element, attr) {
            var sourceUrl = attr.sourceUrl;
            var method = attr.method;
            var paginate = new Paginate(sourceUrl, method);
            console.debug("fluidPagination.paginate1", paginate);
            var pageElement = pagination();
            pageElement.$pagination.prependTo(element);
            var createLinks = function (length) {
                pageElement.ul.find("li[page]").remove();
                var limit = paginate.limit;

                if (limit < length) {
                    var pageCount = Math.ceil(length / limit);
                    var total = pageCount * limit;
                    var lastIndex = limit;
                    if (total > length) {
                        lastIndex = total - length;
                    } else if (total < length) {
                        lastIndex = length - total;
                    }
                    pageElement.ul.attr("max-page", pageCount);
                    var start = 0;
                    console.debug("fluidPagination.pageCount", pageCount);
                    for (var i = 0; i < pageCount; i++) {

                        var size = limit;
                        if (i === pageCount - 1) {
                            size = lastIndex;
                            console.debug("fluidPagination.lastIndex", size);
                        }
                        console.debug("fluidPagination.size", size);
                        var li = $("<li>")
                            .attr("page", (i + 1))
                            .attr("start", start)
                            .attr("row-size", size)
                            .appendTo(pageElement.ul);
                        if (i === 0) {
                            li.addClass("active");
                            pageElement.ul.attr("active-page", 1);
                        }

                        var a = $("<a>").html((i + 1)).appendTo(li);
                        a.unbind("click");
                        start += limit;
                    }

                    pageElement.next.parent().appendTo(pageElement.ul);
                    pageElement.next.unbind("click");
                    pageElement.next.click(function () {
                        var maxPage = pageElement.ul.attr("max-page");
                        var currentPage = pageElement.ul.attr("active-page");
                        if (!currentPage) {
                            currentPage = 1;
                        }
                        if (currentPage < maxPage) {
                            currentPage++;
                            var li = pageElement.ul.find("li[page=" + currentPage + "]");
                            li.trigger("click");
                        }
                    });

                } else {
                    var li = $("<li class='active'>").appendTo(pageElement.ul);
                    var a = $("<a>").html("1").appendTo(li);
                    a.attr("page", 1)
                        .attr("start", 0)
                        .attr("row-size", length);
                    a.unbind("click");
                }
            };
            pageElement.previous.unbind("click");
            pageElement.previous.click(function () {
                var currentPage = pageElement.ul.attr("active-page");
                if (currentPage > 1) {
                    currentPage--;
                    var li = pageElement.ul.find("li[page=" + currentPage + "]");
                    li.trigger("click");
                }
            });
            var query = function (start) {
                if (start) {
                    paginate.start = start;
                }
                paginate.getResultList().success(function (result) {
                    paginate.length = result.length;
                    paginate.resultSize = result.data.length;
                    scope[attr.ngModel] = result.data;
                    t(function () {
                        scope.$apply();
                    });
                });
            };
            var refresh = function () {
                if (!paginate.limit) {
                    paginate.limit = scope.$eval(attr.limit);
                }
                paginate.start = 0;
                paginate.getResultList().success(function (result) {
                    paginate.length = result.length;
                    paginate.resultSize = result.data.length;
                    scope[attr.ngModel] = result.data;
                    createLinks(paginate.length);
                });
            };

            var refreshPage = function () {
                var currentPage = pageElement.ul.attr("active-page");
                var li = pageElement.ul.find("li[page=" + currentPage + "]");
                li.trigger("click");
            };
            pageElement.ul.delegate("li[page]", "click", function (event) {
                var page = $(this);
                var start = page.attr("start");
                var currentPage = page.attr("page");
                var activePage = pageElement.ul.attr("active-page");
                if (activePage) {
                    if (currentPage !== activePage) {
                        pageElement.ul.find("li[page=" + activePage + "]").removeClass("active");
                    }
                }
                page.addClass("active");
                pageElement.ul.attr("active-page", currentPage);
                query(start);
            });

            scope.$watch(attr.limit, function (limit) {
                if (limit) {
                    paginate.setLimit(scope.$eval(limit));
                    refresh();
                }
            });

            refresh();

            if (attr.bottom) {
                var bottom = scope.$eval(attr.bottom);
                if (bottom) {
                    pageElement.$pagination.appendTo(element);
                }
            }

            element.find("th.fluid-sort").each(function () {
                var thead = $(this).parent();
                thead.off();
                var sorter = $(this).find("a");

                if (!sorter) {
                    sorter = $("<a href='#'>").appendTo($(this));
                }


                $(this).click(function () {
                    var sort = sorter.attr("sort");
                    var fieldSorted = $(this).attr("field-name");

                    var sorting = thead.attr("sorting");

                    if (sorting !== fieldSorted) {
                        thead.find("th[field-name='" + sorting + "']")
                            .removeAttr("sort");
                        thead.find("th[field-name='" + sorting + "'] a")
                            .removeClass("fa-sort-desc")
                            .removeClass("fa-sort-asc");
                    }

                    console.debug("fluid-subtable.sorted", sort);
                    if (sort === undefined) {
                        sorter.toggleClass("fa fa-sort-desc");
                        sorter.attr("sort", "asc");
                        sort = "asc";
                    } else if (sort === "asc") {
                        sorter.toggleClass("fa fa-sort-asc");
                        sorter.toggleClass("fa fa-sort-desc");
                        sorter.attr("sort", "desc");
                        sort = "desc";
                    } else if (sort === "desc") {
                        sorter.removeClass("fa fa-sort-desc");
                        sorter.removeClass("fa fa-sort-asc");
                        sorter.removeAttr("sort");
                        sort = undefined;
                    }

                    var sorted = undefined;
                    if (sort === "asc") {
                        sorted = false;
                    } else if (sort === "desc") {
                        sorted = true;
                    } else {
                        fieldSorted = undefined;
                    }
                    thead.attr("sorting", fieldSorted);
                    paginate.setSort(fieldSorted, sort);
                    refreshPage();
                });


            })

        };

        var preFluidPaginationLink = function (scope, element, attr, ngModel) {
            if (!attr.sourceUrl) {
                throw "attribute source-url is required.";
            }
            element.addClass("fluid-pagination");
            c(element.contents())(scope);
        };

        var postFluidPaginationLink = function (scope, element, attr, ngModel) {
            paginator(scope, element, attr);
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

    }])
    .factory("Paginate", ["$http", function (h) {

        var paginate = function (url, method) {
            this.start = 0;
            this.url = url;
            this.method = method;
            this.setSort = function (field, sort) {
                this.sort = {field: field, sort: sort};
            };
            this.setLimit = function (limit) {
                this.limit = limit;
            };
            this.getResultList = function () {
                if (this.method.toLowerCase() === "get") {
                    var params = {};
                    params.start = this.start;
                    if (this.sort) {
                        params.field = this.sort.field;
                        params.sort = this.sort.sort;
                    }
                    if (this.limit) {
                        params.limit = this.limit;
                    }
                    return h({
                        params: params,
                        url: this.url,
                        method: this.method
                    });

                } else if (this.method.toLowerCase === "post") {
                    return h({
                        data: this,
                        url: this.url,
                        method: this.method
                    });
                }
            };

        };

        return paginate;
    }]);

