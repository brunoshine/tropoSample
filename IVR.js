// inject other libraries, i.e. require 

// get caller id
var callerId = currentCall.callerID;
log("Call was from: " + currentCall.callerID);

// query data storage to see if its a known caller id

// if its a know caller id get his name, and conversation language
var knownCaller = {name:'John Doe', lang:'en-GB', contacts: [{name:"Bruno", phone:"0351926368351"}]};

// greet user

// translate to caller native language
var welcomeMessage = "Hi Mr. " + knownCaller.name + ". Welcome to Evil Corp.";
say(welcomeMessage);
log("Said welcome message to " + currentCall.callerID);

// ask to talk to account manager or operator
var actionPickMessage = "With whom would you like to speak?";
var actionPickOptions = "";
// if(knownCaller.contacts !== null){
//     for(var i=0; i < knownCaller.contacts.length; i++){
//         var contact = knownCaller.contacts[i];
//         actionPickMessage += "Press " + (i+1) + " for " + contact.name + ".";
//         actionPickOptions += i+","; 
//     }
// }

actionPickMessage = actionPickMessage + " To speak to the operation please choose 0.";
actionPickOptions = actionPickOptions + "0";

log("created options list");
log(actionPickMessage);
log(actionPickOptions);

log("asking...")
var result=ask(actionPickMessage, {
   choices:actionPickOptions
});
log("picked operation:" + result.value);

var operatorId = parseInt(result.value);
var selectedOperator = "+351999000888"; // by default go to Operator.    

if(operatorId !== 0)
{
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