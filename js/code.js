onKeyDown();
//document.getElementById('txtMessage').value = '';
//document.getElementById('txtMessage').focus();


var currentUserKey = '';
var chatKey = '';
function startChat(friendKey, friendName, friendPhoto) {
    var db = firebase.database().ref('friend_list');
    var friendList = { friendId: friendKey, userId: currentUserKey };
    var flage = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId == friendList.userId)
                || (user.friendId === friendList.userId && user.userId == friendList.friendId)) {
                flage = true;
                chatKey = data.key;
            }
        });

        if (flage === false) {

            chatKey = firebase.database().ref('friend_list').push(friendList, function (error) {
                if (error) alert(error);
                else {

                    document.getElementById("chatPanel").removeAttribute("style");
                    document.getElementById("divStart").setAttribute('style', 'display:none');
                    hideChatList();
                }

            }).getKey();
        } else {

            document.getElementById("chatPanel").removeAttribute("style");
            document.getElementById("divStart").setAttribute('style', 'display:none');
            hideChatList();

        }
        /////////
        document.getElementById("divChatName").innerHTML = friendName;
        document.getElementById("divChatImg").src = friendPhoto;
        /////////////
        LoadChatMessages(chatKey,friendPhoto);
    });
}
/////////////////////////////
function LoadChatMessages(chatKey,friendPhoto) {
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(',');
            if (chat.userId !== currentUserKey) {
                messageDisplay += `<div class="row">
                    <div class="col-1 col-sm-1 col-md-1"><img src="${friendPhoto}" alt=""
                            class="chat-pic rounded-circle"></div>
                    <div class="col-5 col-sm-5 col-md-5">
                        <p class="receive">${chat.msg}
                        <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                     </p>
                    </div>
                </div>`;
            } else {
                messageDisplay += ` <div class="row justify-content-end">
                <div class="col-5 col-sm-5 col-md-5">
                    <p class="sent float-right">${chat.msg}
                        <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
                <div class="col-1 col-sm-1 col-md-1"><img src="${firebase.auth().currentUser.photoURL}" alt="" class="chat-pic rounded-circle"></div>
               
            </div>`;

            }


        });

        document.getElementById('messages').innerHTML = messageDisplay;
        //document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);
        document.getElementById("messages").scrollTop=document.getElementById("messages").scrollHeight
    });
}
function showChatList() {
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}
function hideChatList() {
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}
function onKeyDown() {
    document.addEventListener('keydown', function (key) {
        if (key.which === 13) {
            sendMessage();
        }
    });
}
function sendMessage() {
    var time = new Date();
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        dateTime: time.toLocaleString()
    };
    console.log(chatMessage)
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
        if (error) alert(error);
        else {

            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();
            //document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);
            document.getElementById("messages").scrollTop=document.getElementById("messages").scrollHeight
        }
    });
}



//////////////////////////////////////////////////////////
//////////////////////////////////////////

function LoadChatList() {
    var db = firebase.database().ref('friend_list');

    db.on('value', function (lists) {

        document.getElementById("lstChat").innerHTML = `<li class="list-group-item">
            <input type="text" placeholder="Search or new Chat" class="form-control form-rounded" />
        </li>
        `;
        lists.forEach(function (data) {
            var lst = data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
            } else if (lst.userId === currentUserKey) {
                friendKey = lst.friendId;
            }
            if(friendKey!=""){

            
            firebase.database().ref('users').child(friendKey).on('value', function (data) {
                var user = data.val();
                document.getElementById("lstChat").innerHTML += `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}','${user.name}','${user.photoURL}');">
                <div class="row">
                    <div class="col-md-2"><img src="${user.photoURL}" alt=""
                            class="friend-pic rounded-circle"></div>
                    <div class="col-md-10" style="cursor: pointer;">
                        <div class="name">${user.name}</div>
                        <div class="under-name">this is some message text...</div>
                    </div>
                </div>
            </li>`;
            });


        }
        });
    });
}
function PopulatFriendList() {
    document.getElementById("lstFriend").innerHTML = `<div class="text-center">
        <div class="spinner-border text-primary mt-5" style="width: 7rem; height: 7rem;">
          
        </div>
      </div>`;
    var db = firebase.database().ref('users');
    var list = ``;
    db.on('value', function (users) {
        if (users.hasChildren()) {
            list = ` <li class="list-group-item">
              <input type="text" placeholder="Search or new Chat"
                  class="form-control form-rounded" />
          </li>
         `;
        }
        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                list += ` <li class="list-group-item list-group-item-action" data-dismiss="modal"  onclick="startChat('${data.key}','${user.name}','${user.photoURL}');">
         <div class="row">
             <div class="col-md-2"><img src="${user.photoURL}" alt=""
                     class="friend-pic rounded-circle"></div>
             <div class="col-md-10" style="cursor: pointer;">
                 <div class="name">${user.name}</div>
                 
             </div>
         </div>
     </li>
    `;
            }

        });
        document.getElementById("lstFriend").innerHTML = list;
    });


}
function signIn() {
    //var provider=new firebase.auth.GoogleAuthProvider();
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);

}
function SignOut() {
    firebase.auth().signOut();
}
// onAuthStateChanged(function(user) {
function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}
function onStateChanged(user) {
    if (user) {
        //alert(firebase.auth().currentUser.photoURL+'\n'+firebase.auth().currentUser.displayName);
        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;
        var db = firebase.database().ref('users');
        var flage = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserKey = data.key;
                    flage = true;
                }
            });
            if (flage === false) {
                firebase.database().ref('users').push(userProfile, callback);

            } else {
                document.getElementById("personImage").src = firebase.auth().currentUser.photoURL;
                document.getElementById("personImage").title = firebase.auth().currentUser.displayName;
                document.getElementById("lnkSignIn").style = 'display:none';

                document.getElementById("lnkSignOut").style = '';



            }
            document.getElementById('lnkNewChat').classList.remove('disabled');
            LoadChatList();

        });
    } else {
        document.getElementById("personImage").src = 'images/photo.jpg';
        document.getElementById("personImage").title = '';
        document.getElementById("lnkSignIn").style = '';

        document.getElementById("lnkSignOut").style = 'display:none';

        document.getElementById('lnkNewChat').classList.add('disabled');
    }
}

function callback(error) {
    if (error) {
        alert(error);
    } else {
        document.getElementById("personImage").src = firebase.auth().currentUser.photoURL;
        document.getElementById("personImage").title = firebase.auth().currentUser.displayName;
        document.getElementById("lnkSignIn").style = 'display:none';

        document.getElementById("lnkSignOut").style = '';

    }
}

////////call firebase auth changed
onFirebaseStateChanged();
