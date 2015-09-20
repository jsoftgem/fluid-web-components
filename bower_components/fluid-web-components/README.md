# What is Fluid-web-components?
Fluid-web-components is a simple web application component written in [AngularJS](https://angularjs.org/) and [Bootstrap](http://getbootstrap.com/).

## Goal
- To provide the basic components used in web applications like, tables, pagination, drop-down, etc., with simplified options and tags.
- Creating a drop-down component can be as simple as the following:
```
   <fluid-select label="Limit" values="25,50,75,100" ng-model="limitSize"></fluid-select>
```

## Quick start
```
bower install -g fluid-web-components
```

## Building Fluid-web-components
- [Sass:](http://sass-lang.com/) We used sass to style our components
- To install sass ``` gem install sass ```
- [Grunt:](http://gruntjs.com/) We used Grunt as our build system
- To install dependencies run ``` npm install -g ```
- To build the project run ``` npm package ```


### Getting Started
-  Prerequisite libraries:
```
    <link href="bootstrap.css" rel="stylesheet">
    <link href="font-awesome.css" rel="stylesheet">
    <script src="jquery.js" type="text/javascript"></script>
    <script src="angular.js" type="text/javascript"></script>
    <script src="bootstrap.js" type="text/javascript"></script>
    <script src="angular-filter" type="text/javascript"></script>
```


- Import ```fluid.webComponents``` module to your app:
```
  angular.module("mainApp",["fluid.webComponents"])

```

### Documentation

[demo](http://jsoftgem.github.io/fluid-web-components)

### Authors and Contributors
[Jerico de Guzman](https://ph.linkedin.com/pub/jerico-de-guzman/57/266/351) - Senior Software Engineer.

### Support or Contact
jerico@jsofttechnologies.com
