var UI = (function(){
    function _renderMessage(msgText, msgTime, _sent){
        var sent = _sent || false;
        
        var msgCard = document.createElement('div');
        msgCard.classList.add("message-card", sent ? 'sent' : 'received');

        var msgBody = document.createElement("div");
        msgBody.classList.add("message-body");


        var msgTimestamp = document.createElement("div");
        msgTimestamp.classList.add("message-timestamp");

        msgCard.appendChild(msgBody); 
        msgCard.appendChild(msgTimestamp); 

        var msgContainer = document.getElementById("messages-container");
        msgContainer.appendChild(msgCard);
        msgContainer.scrollTop = msgContainer.scrollHeight;
        if(!sent){
            msgBody.classList.add("loading");

            // 33 is just a magic number... not anything scientific here...
            var fakeWritingTimeout = msgText.length * 33;

            setTimeout(function() {
                msgBody.classList.remove("loading");
                msgBody.innerText = msgText;
                msgTimestamp.innerText = msgTime;
                msgContainer.scrollTop = msgContainer.scrollHeight;


                var event = new Event("renderMessageFinish");
                document.dispatchEvent(event);
            }, fakeWritingTimeout);
        } else {
            msgBody.innerText = msgText;
            msgTimestamp.innerText = msgTime;
            //document.getElementById("messages-container").appendChild(msgCard);

            var event = new Event("renderMessageFinish");
            document.dispatchEvent(event);
        }


    }

    return {
        renderMessage: _renderMessage
    }
}());

var App = (function(){

    var currQuestion = 0;
    var currScore = 0;
    
    
    var questions = [
        {
            'question': 'How are you today?',
            'answers': [
                {label: "Amazing 😍", value: '1'},
                { label: "OK 😶", value: '2' },
                { label: "Not that good... 🙄", value: '3' }
            ]
        },
        {
            'question': 'Can I make you happier?',
            'answers': [
                { label: "Sure! 😀", value: '1' },
                { label: "Maybe 🤔", value: '2' },
                { label: "I don't think so 😑", value: '3' },
            ]
        },
        {
            'question': 'Ok, I\'ll tell you a joke then!\r\nWhy did the chicken cross the road?',
            'answers': []
        },      
        {
            'question': 'Because she wanted to stretch her legs! 😂' ,
            'answers': [
                { label: "😂😂😂", value: '1' },
                { label: "I've heard better jokes, but still good! 🙂", value: '2' },
                { label: "You forgot the joke part 😒", value: '3' },
            ] 
        }        
    ];


    var choisesContainer = document.getElementById("message-compose-text");
    var choices = new Choices(choisesContainer, {
        choices: [

        ],
        searchChoices: true,
        searchEnabled: true,
        searchFields: ["label"],
        maxItemCount: 1
    });

    choisesContainer.addEventListener("addItem", function(e) {
        document.getElementById("send-message").removeAttribute("disabled");
    });


    
    function _askQuestion(){
        choices.setValue([
            { label:'Select reply', value: '0', disabled: true}
        ]);


        var d = new Date();
        var timestamp = d.toLocaleTimeString();
        
        if (currQuestion >= questions.length ){
            var result = '';
            if (currScore > 0 && currScore < 6) {
              result = "You are a really fun person! Have a nice day! 😀";
            } else if (currScore >= 6 && currScore < 9) {
                result = "I hope that I've brightened a bit more your day! 🙂";
            } else {
                result = "I'm sorry, I hope the best for you, everything will workout! 🙌";
            }

            UI.renderMessage(result, timestamp);
            choices.setValue(['You can\'t reply to this conversation']);
            choices.disable();
            document.getElementById("send-message").setAttribute("disabled", "disabled");
            return;
        }

        UI.renderMessage(questions[currQuestion].question, timestamp)

        choices.setChoices(questions[currQuestion].answers, "value", "label", true);
        if (questions[currQuestion].answers.length == 0){
            
            var fn = function (e) {
                currQuestion++;
                _askQuestion();

                document.removeEventListener("renderMessageFinish", fn, false);

                
            }
            
            document.addEventListener("renderMessageFinish",fn, false);
            
        }

        document.getElementById("send-message").setAttribute("disabled", "disabled");
    }

    function _replyQuestion() {
        var reply = choices.getValue();

        var d = new Date();
        var timestamp = d.toLocaleTimeString();
        UI.renderMessage(reply.label, timestamp, true);

        var answerScore = reply.value;
        currScore += Number.parseInt(answerScore);
        console.info(currScore);

        currQuestion++;

        _askQuestion();
    }

    return {
        askQuestion: _askQuestion,
        replyQuestion: _replyQuestion,
    }
}());

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  // add a zero in front of numbers<10
  if (m < 10) {
    m = "0" + m;
  }
  document.getElementById("clock").innerHTML = h + ":" + m;
  t = setTimeout(function() {
    startTime();
  }, 30000);
};

function startup(){
    document.getElementById('send-message').addEventListener('click', App.replyQuestion);
    
    var d = new Date();
    var timestamp = d.toLocaleTimeString();
    document.getElementById("first-msg-time").innerText = timestamp;
    
    startTime();
    setTimeout(App.askQuestion, 750);
}

document.addEventListener("DOMContentLoaded", startup);
