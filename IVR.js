// inject other libraries, i.e. require? cannot inject libs.
function requestJSONviaGET(requestedURL) {
    try {
        var connection = new java.net.URL(requestedURL).openConnection();
        connection.setDoOutput(false);
        connection.setDoInput(true);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("charset", "utf-8");
        connection.connect();

        var responseCode = connection.getResponseCode();
        log("JSON_LIBRARY: read response code: " + responseCode);
        if (responseCode < 200 || responseCode > 299) {
            log("JSON_LIBRARY: request failed");
            return undefined;
        }

        // Read stream and create response from JSON
        var bodyReader = connection.getInputStream();
        // [WORKAROUND] We cannot use a byte[], not supported on Tropo
        // var myContents= new byte[1024*1024];
        // bodyReader.readFully(myContents);
        var contents = new String(org.apache.commons.io.IOUtils.toString(bodyReader));
        var parsed = JSON.parse(contents);
        log("JSON_LIBRARY: JSON is " + parsed.toString());

        return parsed;
    }
    catch (e) {
        log("JSON_LIBRARY: could not retreive contents, socket Exception or Server Timeout");
        return undefined;
    }
}



// get caller id
var callerId = currentCall.callerID;
log("Call was from: " + currentCall.callerID);

// query data storage to see if its a known caller id
// TODO: Move to Azure Tables
var data = requestJSONviaGET("https://raw.githubusercontent.com/brunoshine/tropoSample/master/sample_data.json");
// var data = [
//     {
//         "name":"Bruno Figueiredo", 
//         "phone": "0351926368351",
//         "lang":"en-GB", 
//         "contacts": [{"name":"Bruno", "phone":"0351926368351"}]
//     },
//     {
//         "name":"John Doe", 
//         "lang":"pt-PT", 
//         "contacts": [{"name":"Bruno", "phone":"0351926368351"}]
//     }
// ];

var filteredData = data.filter(function(el){
    el.phone == callerId;
});

// // if its a know caller id get his name, and conversation language
// var knownCaller = null;
// if(filteredData && filteredData.length === 1){
//     knownCaller = filteredData[0];
// }
var knownCaller = data[0];

// greet user

// translate to caller native language
var welcomeMessage = "Hello Mr. " + knownCaller.name + ". Welcome to the Matrix.";
say(welcomeMessage);
log("Said welcome message to " + currentCall.callerID);

// ask to talk to account manager or operator
var actionPickMessage = "With whom would you like to speak?";
var actionPickOptions = "";
if(knownCaller.contacts !== null){
    for(var i=0; i < knownCaller.contacts.length; i++){
        var contact = knownCaller.contacts[i];
        var opt = i + 1;
        // +=  IS NOT SUPPORTED
        actionPickMessage = actionPickMessage + "Press " + opt + " for " + contact.name + ".";
        actionPickOptions = actionPickOptions + opt + ","; 
    }
}

actionPickMessage = actionPickMessage + " To speak to the operator please choose 0.";
actionPickOptions = actionPickOptions + "0";

log("created options list");
log(actionPickMessage);
log(actionPickOptions);

log("asking...");
var result=ask(actionPickMessage, {
   choices:actionPickOptions
});
log("picked operation:" + result.value);

var operatorId = parseInt(result.value);
var selectedOperator = "+351999000888"; // by default go to Operator.    

if(operatorId !== 0){
    selectedOperator = knownCaller.contacts[operatorId-1].phone;
    say("You picked to speak to " + knownCaller.contacts[operatorId-1].name + ".");
    log("said transfing to picked contact");
}else{
    say("You picked to speak to the Operator.");
    log("said transferring to operator");
}

// redirect call to selected contact (AM or Operator)

//translate transfer message to caller native language
var transferMessage ="Transferring you now, please wait."; 

// transfer
say(transferMessage);
//transfer(selectedOperator);