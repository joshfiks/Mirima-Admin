
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ==========================================
// MIRIMA ADMIN — SHARED CHAT MODULE
// Uses Mirima Connect's existing Firestore structure
// ==========================================

// Listen to conversations for one department.
export function listenToDepartmentConversations(
    department,
    callback,
    onError = console.error
) {
    const conversationsRef = collection(
        db,
        "chatConversations"
    );

    const conversationsQuery = query(
        conversationsRef,
        where("department", "==", department)
    );

    return onSnapshot(
        conversationsQuery,
        (snapshot) => {
            const conversations = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );

            callback(conversations);
        },
        onError
    );
}

// Listen to messages inside one conversation.
export function listenToConversationMessages(
    conversationId,
    callback,
    onError = console.error
) {
    const messagesRef = collection(
        db,
        "chatConversations",
        conversationId,
        "messages"
    );

    const messagesQuery = query(
        messagesRef,
        orderBy("createdAt", "asc")
    );

    return onSnapshot(
        messagesQuery,
        (snapshot) => {
            const messages = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );

            callback(messages);
        },
        onError
    );
}

// Send a reply from Mirima Admin.
export async function sendChatMessage(
    conversationId,
    sender,
    message
) {
    const cleanMessage = message.trim();

    if (!conversationId || !cleanMessage) {
        throw new Error(
            "A conversation and message are required."
        );
    }

    const conversationRef = doc(
        db,
        "chatConversations",
        conversationId
    );

    const conversationSnapshot = await getDoc(
        conversationRef
    );

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found.");
    }

    await addDoc(
        collection(
            db,
            "chatConversations",
            conversationId,
            "messages"
        ),
        {
            sender,
            senderName: "Mirima Admin",
            message: cleanMessage,
            createdAt: serverTimestamp()
        }
    );

    await updateDoc(
        conversationRef,
        {
            updatedAt: serverTimestamp()
        }
    );
}
