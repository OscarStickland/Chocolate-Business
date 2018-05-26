electron = require('electron')
var ipcRenderer = require('electron').ipcRenderer; 
    
var money;
var chocolate;
var chartInfomation = [];
let chartData = [];

//Send Request for infomation
ipcRenderer.send('request-index-infomation');

//Catch Return Infomation
ipcRenderer.on('main-infomation-return', function (event, arg) {

    money = arg[0]
    console.log(money);
    chocolate = arg[1]
    chartInfomation = arg[2]
    //console.log("INDEX - Got Infomation");
    document.getElementById("money").innerHTML = "Current Money: $" + String(money);
    document.getElementById("chocolate").innerHTML = "Current Chocolate: " + String(chocolate) + " bars";
    
    chartData = [
    ['Date', 'Total Cash']
    ];

    
    setTimeout(function() {
        var i = 0;
        for (; i < chartInfomation.length; i++) { 
            console.log('hi');
            chartData.push([chartInfomation[i][0], parseFloat(chartInfomation[i][1])]);
        }
    }, 100);    
    

});

function reload() {
    ipcRenderer.send("reload-index-infomation");
}