var firstInteraction = true

function createGuid() {  
    function _p8(s) {  
        var p = (Math.random().toString(16)+"000000000").substr(2,8);  
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;  
    }  
    return _p8() + _p8(true) + _p8(true) + _p8();  
}  

async function generateDirectLineToken() {
    const secret = 'b-wrvSDk5Sk.5OpB2ZHFNZYEt9ZJX9D_qYFR-KvSUw5snBALLUjl0wc';
    var guid = createGuid();
    const response = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + ' ' + secret
        },
        body: JSON.stringify(
            {
                "user": {
                    "id": "dl_" + guid
                }
            })
    })
    const { token } = await response.json();
    return token;
}

async function refreshDirectLineToken(token) {
    const response = await fetch('https://directline.botframework.com/v3/directline/tokens/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + ' ' + token
        },
    })
    if (response.status === 200) {
        var obj = JSON.parse(await response.text());
        OpenChat(obj.token);
    }
    else {
        console.log(response.statusText);
    }
}

function CloseChat() {
    document.getElementById("chatbox").style.display = "none";
    document.getElementById("chatbutton").style.display = "flex";
}

async function OpenChat() {
    document.getElementById("chatbutton").style.display = "none";
    document.getElementById("chatbox").style.display = "block";

    if (firstInteraction) {
        // Get welcome message
        // We are using a customized store to add hooks to connect event
        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
            //console.log(action);
            if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
                dispatch({
                    type: 'WEB_CHAT/SEND_EVENT',
                    payload: {
                        name: 'webchat/join',
                        value: { language: window.navigator.language }
                    }
                });
            }

            return next(action);
        });

        window.WebChat.renderWebChat(
            {
                directLine: window.WebChat.createDirectLine({
                token: await generateDirectLineToken()
            }),
            store,
            },
            document.getElementById('chatbody')
        );

        firstInteraction = false;
    }    
}