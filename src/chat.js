import React, { useEffect, useRef } from "react";
import { socket } from "./socket";
import { useSelector } from "react-redux";

export default function Chat() {
    //elemRef will be responsible to have the chat container scrolled down to the bottom
    const elemRef = useRef();
    const chatMessages = useSelector((state) => state.chat && state.chat);

    const keyCheck = (e) => {
        console.log("value: ", e.target.value);
        console.log("key pressed ", e.key);

        if (e.key === "Enter") {
            //prevents that a new line is created in the textfield on typing "Enter"
            e.preventDefault();
            console.log("our message: ", e.target.value);
            //this emits an event to socket.io --> code in index.js runs
            socket.emit("New Message", e.target.value);
            //clearing the input field afterwards
            e.target.value = "";
        }
    };

    useEffect(() => {
        //every time there is a new chat message the window scrolls to the bottom
        console.log("elemRef.current.scrollTop ", elemRef.current.scrollTop);
        console.log(
            "elemRef.current.scrollHeight",
            elemRef.current.scrollHeight
        );
        console.log(
            "elemRef.current.clientHeight",
            elemRef.current.clientHeight
        );

        elemRef.current.scrollTop =
            elemRef.current.scrollHeight - elemRef.current.clientHeight;
    });

    return (
        <div className="communityChat">
            <h1>Welcome to the Community-Chat</h1>
            <hr className="divider" />
            <div className="chat-message-container" ref={elemRef}>
                {chatMessages &&
                    chatMessages.map((msg) => {
                        return (
                            <div className="chatBox" key={msg.msg_id}>
                                <div className="chatUserProfile">
                                    <img src={msg.profile_picture_url} />
                                    <p>
                                        {msg.first} {msg.last}{" "}
                                    </p>
                                </div>
                                <div className="chatMessage">
                                    <p className="messageText">{msg.msg}</p>
                                    <p className="messageTimeTag">
                                        {msg.created_at.slice(0, 19)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
            </div>
            <hr />
            <textarea
                placeholder="Here comes your message"
                onKeyDown={keyCheck}
            ></textarea>
        </div>
    );
}
