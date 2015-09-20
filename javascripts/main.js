console.log('This would be the main JS file.');
angular.module("mainApp", ["fluid.webComponents"])
    .controller("mainController", [function () {

    }])
    .factory("People", function () {
        return [
            {name: "John Doe", email: "john_doe@jsofttehcnologies.com", age: 25},
            {name: "Mary Ann", email: "mary_ann@jsofttechnologies.com", age: 23},
            {name: "Abigail Smith", email: "abigail_smith@jsofttechnologies.com", age: 28},
            {name: "Henry Flint", email: "henry_flint@jsofttehcnologies.com", age: 32},
            {name: "Allen Shaw", email: "allen_shaw@jsofttechnologies.com", age: 25},
            {name: "Calcium Kid", email: "calcium_kid@jsofttechnologies.com", age: 35}
        ]
    }).factory("Animals", function () {
        return [
            {name: "Dog", img: "images/animals/dog.jpg"},
            {name: "Cat", img: "images/animals/cat.jpg"},
            {name: "Bear", img: "images/animals/bear.jpg"},
            {name: "Wolf", img: "images/animals/wolf.jpg"},
            {name: "Lion", img: "images/animals/lion.jpg"},
            {name: "Horse", img: "images/animals/horse.jpg"}
        ]
    }).directive("escape", [function () {

        return {
            restrict: "AE",
            terminal: true,
            link: function (scope, element, attr) {
                var html = element.html();
                html = html.replace(/&/g, "&amp;");
                html = html.replace(/</g, "&lt;");
                html = html.replace(/>/g, "&gt;");
                console.debug("html",html);
                var p = $("<p>");
                p.html(html);
                element.replaceWith(p);

            }
        }

    }]);