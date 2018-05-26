electron = require('electron')
path = require('path')
url = require('url')
fs = require('fs')

mysql = require('mysql');
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'chocolate-business'
  });

//Database


const {app, BrowserWindow, alert} = electron

let mainWindow;
let NewEntryWindow;
let NewDistributionWindow;
let NewPaymentWindow;
let result;

//Main Infomation
let money = 0;
let chocolate;
let chartInfomation = [];

//Setting Up IPC Main
var ipcMain = require('electron').ipcMain;

//Only Run Once
function Init() {
    console.log("Initing");

     
    connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + connection.threadId);
      });

      connection.query('SELECT * FROM chocolatentry', function (error, results, fields) {
        if (error) throw error;
  
        for(var i = 0; i < results.length; i++) {
            console.log(results[i].CountEntryID);
        }
        
    }); 
     


}

//Reload Infomation
function Reload() {
    
    money = 0;
    chartInfomation = [];

    //Count Entrys
    connection.query('SELECT * FROM CountEntry', function (error, results, fields) {
        if (error) throw error;
  
        for(var i = 0; i < results.length; i++) {
            if (results[i].MoneyReset == 1) {
                money = 0;
            }
            money = money + results[i].MoneyBroughtHome;
        }
        
      });
    
    fs.readFile(path.join(__dirname, "/Infomation/chocolate.txt"), function (err, data) {
        if (err) {
          return console.error("MAIN (Chocolate) - " + err);
        }
        //console.log("MAIN - Asynchronous read of Chocolate: " + chocolate.toString());
    });
}


//Setting Up Initial Window
app.on('ready', function(){

    mainWindow = new BrowserWindow({
        title:'Chocolate Business',
        width: 1000,
        height: 700,
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol:'file:',
        slashes: true
    }));

    Init();
    Reload();


});



function createNewEntryWindow() {
    NewEntryWindow = new BrowserWindow({
        title:'New Entry',
        width:500,
        height: 500,
    });

    NewEntryWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/newEntryWindow.html'),
        protocol: 'file:',
        slashes: true
    }));


    //Garbage collection handle
    mainWindow.on('close', function(){
        NewEntryWindow == null;
    });
}

function createDistributionWindow() {
    NewDistributionWindow = new BrowserWindow({
        title:'New Distribution',
        width:500,
        height: 500,
    });

    NewDistributionWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/newDistributionWindow.html'),
        protocol: 'file:',
        slashes: true
    }));


    //Garbage collection handle
    mainWindow.on('close', function(){
        connection.end();
        NewDistributionWindow == null;
    });
}

//Create Payment Window
function createPaymentWindow() {
    NewPaymentWindow = new BrowserWindow({
        title:'New Payment',
        width:500,
        height: 500,
    });

    NewPaymentWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/newPaymentWindow.html'),
        protocol: 'file:',
        slashes: true
    }));


    //Garbage collection handle
    mainWindow.on('close', function(){
        connection.end();
        NewPaymentWindow = null;
    });
}


//Catch Create New Entry Window()
ipcMain.on('show-entry-window', function(event) {
    createNewEntryWindow();
    //do child process or other data manipulation and name it manData
  });

//Catch Create New distribution Window()
ipcMain.on('show-distribution-window', function(event) {
    createDistributionWindow();
    //do child process or other data manipulation and name it manData
  });

ipcMain.on('show-payment-window', function(event) {
    createPaymentWindow();
    //do child process or other data manipulation and name it manData
  });

//Catch Request Index Infomation
ipcMain.on('request-index-infomation', function(event){
    //console.log("MAIN - Got the Request")
    data = [money, chocolate, chartInfomation];
    event.sender.send('main-infomation-return', data);
});

//Catch Realod
ipcMain.on('reload-index-infomation', function(event) {
    Reload();

    setTimeout(function(){
        data = [money, chocolate, chartInfomation];
        event.sender.send('main-infomation-return', data);
    },100);


});

//Catch Form Submit form New Entry Window
ipcMain.on("entry-window-submit", function(event, arg) {
    var sql = "INSERT INTO countentry (Date, MoneyBroughtHome, MoneyReset) VALUES ?";
    console.log(arg[0]);
    console.log(arg[1]);
    var values = [[arg[0], arg[1], "0"]];

    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });
    

    NewEntryWindow == null;

    Reload();

});


