var app = angular.module('showRedlistEvalResult', []);
app.controller('loadJsonController', ['$scope', '$sce', '$window', 'loadJsonService', function ($scope, $sce, $window, loadJsonService) {


  $scope.getData = function (url) {
    loadJsonService.getData(url)
      .then(function (ret) {
        $scope.res = ret['data'];
        $scope.res.forEach(function(r, i){
          $scope.res[i].a = 'http://twebi.net/workflow/demo/redListEval/?col=' + r.col + '&ns=';
        })
      });
  }

  $scope.getData('redlist.json');

}]);

app.factory('loadJsonService', ['$http', function($http) {
  var getData = function (URL, reqData) {
    return $http.post(URL, reqData).
             then(
               function (response) {
                 return response;
               },
               function (httpError) {
                 // translate the error
                 throw httpError.status + " : " +
                       httpError.data;
               }
             );
  };
  return {getData: getData}
}]);

