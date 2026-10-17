
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =========================================================
// MIRIMA ADMIN — SHARED CHAT MODULE
// =========================================================

// Get conversations belonging to a department.
export function listenToDepartmentConversations(
    department,
    callback,
    onError = console.error
) {
    const conversationsRef = collection(db, "conversations");

    const conversationsQuery = query(
        conversationsRef,
        where("department", "==", department)
    );

    return onSnapshot(
        conversationsQuery,
        (snapshot) => {
            const conversations = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));

            callback(conversations);
        },
        onError
    );
}

// Listen to messages in one conversation.
export function listenToConversationMessages(
    conversationId,
    callback,
    onError = console.error
) {
    const messagesRef = collection(
        db,
        "conversations",
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
            const messages = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));

            callback(messages);
        },
        onError
    );
}

// Send a text message in an existing conversation.
export async function sendChatMessage(
    conversationId,
    sender,
    text
) {
    const messageText = text.trim();

    if (!conversationId || !messageText) {
        throw new Error(
            "A conversation and message text are required."
        );
    }

    const conversationRef = doc(
        db,
        "conversations",
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
            "conversations",
            conversationId,
            "messages"
        ),
        {
            text: messageText,
            sender,
            createdAt: serverTimestamp()
        }
    );
}

