
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
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
        console.count("Firestore message snapshot received");
         console.log(
    "SNAPSHOT CHANGES:",
    snapshot.docChanges().map(change => ({
        type: change.type,
        id: change.doc.id,
        guestDeliveredAt: change.doc.data().guestDeliveredAt,
        guestReadAt: change.doc.data().guestReadAt
    }))
);
        console.log("Snapshot document count:", snapshot.size);
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
            console.count("Firestore message snapshot received");
            console.log("Snapshot document count:", snapshot.size);

       
snapshot.docChanges().forEach((change) => {
    console.log("CHANGED MESSAGE ID:", change.doc.id);

    console.log(
        "CHANGED FIELD VALUES (JSON):",
        JSON.stringify(
            change.doc.data(),
            (key, value) =>
                value && typeof value.toDate === "function"
                    ? value.toDate().toISOString()
                    : value,
            2
        )
    );
});


            const messages = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));

            console.log("Messages passed to dashboard:", messages.length);

            callback(messages);
        },
        onError
    );
}

 // Send a text reply or attachment from Mirima Admin.
export async function sendChatMessage(
    conversationId,
    sender,
    message,
    attachment = null
) {
    const cleanMessage =
        typeof message === "string" ? message.trim() : "";

    if (!conversationId) {
        throw new Error("A conversation is required.");
    }

    // Require either text or an attachment.
    if (!cleanMessage && !attachment?.attachmentUrl) {
        throw new Error(
            "A message or attachment is required."
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

    // Build the message using the existing Firestore structure.
    const messageData = {
        sender,
        senderName: "Reception",
        message: cleanMessage,
        createdAt: serverTimestamp()
    };

    // Add attachment fields only when an attachment is provided.
    if (attachment?.attachmentUrl) {
        messageData.attachmentUrl = attachment.attachmentUrl;
        messageData.attachmentName = attachment.attachmentName || "Attachment";
        messageData.attachmentType =
            attachment.attachmentType || "application/octet-stream";
        messageData.attachmentSize = attachment.attachmentSize || 0;
    }

    await addDoc(
        collection(
            db,
            "chatConversations",
            conversationId,
            "messages"
        ),
        messageData
    );

    await updateDoc(conversationRef, {
        updatedAt: serverTimestamp()
    });
}

// ==========================================
// GET LATEST MESSAGE FOR A CONVERSATION
// ==========================================

export async function getLatestConversationMessage(
    conversationId
) {
    const messagesRef = collection(
        db,
        "chatConversations",
        conversationId,
        "messages"
    );

    const latestMessageQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(
        latestMessageQuery
    );

    if (snapshot.empty) {
        return null;
    }

    const latestMessage = snapshot.docs[0];

    return {
        id: latestMessage.id,
        ...latestMessage.data()
    };
}
