import React from "react";
import moment from 'moment';

function ChatCard(props) {
    return (
        <div style={{ width: '90%',background:"#e0e8e6",margin:"10px",padding:"10px",overflow:"auto" }}>
        <p><strong>{props.sender.name}:</strong> {props.message}</p>

        </div>
    )
}

export default ChatCard;
