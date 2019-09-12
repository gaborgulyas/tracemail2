
function LOG(text) {
    var t = "";
    if (typeof text == 'object' && text !== null) {
        for (var a in text) {
            t += a+': ';
            try { t += text[a]; } catch (e) { t += 'err'; }
            t += "\n";
        }
    } else {
        t = text;
    }
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(t);
}

function Ip(attributes) {

    this.httpGet = function (theUrl) {
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                return xmlhttp.responseText;
            }
        };
        xmlhttp.open("GET", theUrl, false );
        xmlhttp.send();
        return xmlhttp.responseText;
    };

	//copy attributes
	for (var i in attributes) {
		this[i] = attributes[i];
	}

    this.my_id = 'epvp@pet-portal.eu';
    this.database = 'iplocator.sqlite';

    //get datas of ipaddr
    //connect to database
    ////
    //var em = Components.classes["@mozilla.org/extensions/manager;1"].
    //getService(Components.interfaces.nsIExtensionManager);
    ////
    
    //get db file
    ////
    //var dbFile = em.getInstallLocation(this.my_id).getItemFile(this.my_id, this.database);
    var dbFile = initFile(this.my_id, this.database);
    ////

    var dbService = Components.classes["@mozilla.org/storage/service;1"].
    getService(Components.interfaces.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists()) {
        alert('The database file not found!');
        return;
    }
    else {
        dbConnection = dbService.openDatabase(dbFile);
    }

    //Get location from IP address
    var ipDataQuery = "http://ip-api.com/csv/"+ this.ip + "?fields=status,countryCode,city,lat,lon";
    let ipDataString = this.httpGet(ipDataQuery);
    var ipData = ipDataString.split(',');

    this.Comment = "";
    this.BubbleLink = 'bubblelink';
    this.NodeIP = this.ip;
    if (ipData[0] == "success") {
        this.City = ipData[2];
        this.Latitude = ipData[3];
        this.Longitude = ipData[4];
    } else {
        this.CountryName = "Reserved";
        this.Code = '';
        this.City = '';
        this.Latitude = '';
        this.Longitude = '';
        this.DataRet = true;
        this.Warrantless = true;
        this.DataRetText = '';
        this.WarrantlessText = '';
        return this;
    }

    ////-
    //var statement = dbConnection.createStatement("SELECT * FROM ip LEFT JOIN country country ON country.id = ip.country WHERE ip <= :ip ORDER BY ip DESC LIMIT 1");
    try {
    var statement = dbConnection.createStatement("SELECT * FROM country WHERE :countrycode = country.code");
    } catch (e) { LOG(e); }
    ////-

    //execute query
    statement.params.countrycode = ipData[1];
    var res = statement.executeStep();

    ////-
    if (res) {
        this.CountryName = statement.row.countryname;
        this.Code = statement.row.alpha3code;
        this.DataRet = statement.row.dataretention == '1' ? true : false;
        this.Warrantless = statement.row.warrantless == '1' ? true : false;
        this.DataRetText = statement.row.dataretentiontext;
        this.WarrantlessText = statement.row.warrantlesstext;
    }

    return this;
}