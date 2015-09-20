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
    });