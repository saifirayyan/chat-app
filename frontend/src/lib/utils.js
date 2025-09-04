export function formateMessageTime(date){
    return new Date(date).toLocaleTimeString("eng-US", {
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true
    });
}