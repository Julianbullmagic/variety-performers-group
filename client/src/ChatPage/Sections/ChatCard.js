import React from "react";

function ChatCard(props) {
    return (
        <div style={{ width:'95%',background:"#e0e8e6",margin:"1vw",padding:"10px",overflow:"auto" }}>
        <p style={{margin:"0.5vw"}}><strong>{props.sender.name}:</strong> {props.message}</p>
        </div>
    )
}

export default ChatCard;
