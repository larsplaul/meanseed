'use strict';

angular.module('myApp.loginview', ['ngRoute'])

//Uses the controller AppLoginCtrl
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewlogin', {
    templateUrl: 'app/viewlogin/viewlogin.html'
  });
}]);
