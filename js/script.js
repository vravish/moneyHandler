angular.module('myApp', ['angularSpinner'])
    .controller('myCtrl', function($scope, $http) {
        // $scope.url = "http://vravishankar-test.apigee.net/coffee";
        $scope.url = "http://localhost:3000/coffee";
        // $scope.url = "http://apigee-bench-prod.e2e.apigee.net/test-java-callout";

        $scope.types = {
            A: "Espresso",
            B: "Cappuccino",
            C: "Frappuccino"
        };

        $scope.sophisticationOptions = [
            {name: 'I only drink tea', wait: 30, shortName: 'Tea drinkers'},
            {name: 'I\'d be happy with instant coffee', wait: 15, shortName: 'Instant coffee'},
            {name: 'I love Nespresso', wait: 5, shortName: 'Nespresso'},
            {name: 'I\'m a coffee snob!', wait: 1, shortName: 'Coffee snobs'}
        ];

        $scope.difficulties = {
            '30': 21,
            '15': 20,
            '5': 18,
            '1': 1
        };

        $scope.typesDataset = [{    data: [[$scope.types.A, 0], [$scope.types.B, 0], [$scope.types.C, 0]],
                                    color: "green"}];
        $scope.graphOptions = {
            series: {
                stack: 0,
                bars: {
                    fill: true,
                    show: true,
                    barWidth: 0.6,
                    align: 'center'
                }
            },
            xaxis: {
                mode: 'categories',
                tickLength: 0,
                font: {
                    size:15,
                    weight:"bold",
                    color:"black"
                }
            },
            yaxis: {
                minTickSize: 1,
                tickDecimals: 0,
                font: {
                    size:15,
                    weight:"bold",
                    color:"black"
                },
                min: 0
            }
        };

        $scope.successDataset = [{data: [   [$scope.sophisticationOptions[0].shortName, 0],
                                            [$scope.sophisticationOptions[1].shortName, 0],
                                            [$scope.sophisticationOptions[2].shortName, 0],
                                            [$scope.sophisticationOptions[3].shortName, 0] ], color: "green"}];

        $scope.waitingDataset = [[  [$scope.sophisticationOptions[0].shortName, 0],
                                    [$scope.sophisticationOptions[1].shortName, 0],
                                    [$scope.sophisticationOptions[2].shortName, 0],
                                    [$scope.sophisticationOptions[3].shortName, 0] ]];

        $scope.failedDataset = [{data: [    [$scope.sophisticationOptions[0].shortName, 0],
                                            [$scope.sophisticationOptions[1].shortName, 0],
                                            [$scope.sophisticationOptions[2].shortName, 0],
                                            [$scope.sophisticationOptions[3].shortName, 0] ], color: "red"}];

        $scope.getRequestQueueData = function(requestQueue) {
            $scope.waitingDataset[0][0][1] = 0;
            $scope.waitingDataset[0][1][1] = 0;
            $scope.waitingDataset[0][2][1] = 0;
            $scope.waitingDataset[0][3][1] = 0;

            for (var name in requestQueue) {
                if (requestQueue.hasOwnProperty(name)) {
                    switch(requestQueue[name].waitTime) {
                        case '30':
                            $scope.waitingDataset[0][0][1]++;
                            break;
                        case '15':
                            $scope.waitingDataset[0][1][1]++;
                            break;
                        case '5':
                            $scope.waitingDataset[0][2][1]++;
                            break;
                        case '1':
                            $scope.waitingDataset[0][3][1]++;
                            break;
                    }
                }
            }
        };

        $scope.refreshFromService = function() {
            $http.get($scope.url)
                .then(function(response) {
                    $scope.bagsLeft = response.data.coffeeBags;

                    $scope.typesDataset[0].data[0][1] = response.data.A;
                    $scope.typesDataset[0].data[1][1] = response.data.B;
                    $scope.typesDataset[0].data[2][1] = response.data.C;

                    $scope.successDataset[0].data[0][1] = response.data.waitTimes['30'];
                    $scope.successDataset[0].data[1][1] = response.data.waitTimes['15'];
                    $scope.successDataset[0].data[2][1] = response.data.waitTimes['5'];
                    $scope.successDataset[0].data[3][1] = response.data.waitTimes['1'];

                    $scope.failedDataset[0].data[0][1] = response.data.waitTimesAll['30'] - response.data.waitTimes['30'];
                    $scope.failedDataset[0].data[1][1] = response.data.waitTimesAll['15'] - response.data.waitTimes['15'];
                    $scope.failedDataset[0].data[2][1] = response.data.waitTimesAll['5'] - response.data.waitTimes['5'];
                    $scope.failedDataset[0].data[3][1] = response.data.waitTimesAll['1'] - response.data.waitTimes['1'];

                    $scope.getRequestQueueData(response.data.requestQueue);

                    $.plot("#bags-placeholder", $scope.typesDataset, $scope.graphOptions);
                    $.plot("#queue-placeholder", $scope.waitingDataset, $scope.graphOptions);
                    $.plot("#all-placeholder", $scope.successDataset.concat($scope.failedDataset), $scope.graphOptions);
                }, function(response) {
                    console.log("Error!");
                    console.log(response);
                });

            setTimeout($scope.refreshFromService, 1000);
        };

        $scope.refreshFromService();

        $scope.cleanResponse = function(response) {
            if (response.data.bagAssigned)
                return "You got a coffee bag of type: " + $scope.types[response.data.type] + ". After your request, there are still " + response.data.bagsLeft + " bags left.\n";
            else
                return "You did not get a coffee bag!";
        };

        $scope.requestCoffeeBag = function(name, type, waitTime) {
            $scope.statusText = "You will wait " + waitTime + " seconds before getting a bag. Please wait for the server to fulfill your request...";
            $scope.showSpinner = true;

            $http.post($scope.url, JSON.stringify({name: name, type: type, difficulty: $scope.difficulties[waitTime]}))
                .then(function(response) {
                    $scope.statusText = $scope.cleanResponse(response);
                    $scope.showSpinner = false;
                }, function(response) {
                    console.log("Error!");
                    console.log(response);

                    $scope.statusText = "Error: " + response.data;
                    $scope.showSpinner = false;
                });
        };

        $scope.resetBeans = function() {
            $http.delete($scope.url)
                .then(function(response) {
                }, function(response) {
                    console.log("Error!");
                    console.log(response);

                    alert("Error: " + response.data);
                });
        };
    });