import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Message, Expense } from "@/types";

// ==================== USERS ====================
export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid: string, data: Record<string, unknown>) => {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
};

// ==================== GROUPS ====================
export interface GroupData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelType: string;
  maxMembers: number;
  description: string;
  isPrivate: boolean;
  image?: string;
  coverImage?: string;
  places?: Array<{ id: string; name: string; lat: number; lng: number }>;
  createdBy: string;
  createdByName: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export const createGroup = async (data: Omit<GroupData, "createdAt">) => {
  const groupRef = await addDoc(collection(db, "groups"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  // Add creator as member
  await setDoc(doc(db, "groupMembers", `${groupRef.id}_${data.createdBy}`), {
    groupId: groupRef.id,
    userId: data.createdBy,
    userName: data.createdByName,
    role: "admin",
    joinedAt: serverTimestamp(),
  });
  return groupRef.id;
};

export const getUserGroups = async (userId: string) => {
  const snap = await getDocs(query(collection(db, "groupMembers"), where("userId", "==", userId)));
  const groupIds = snap.docs.map((d) => d.data().groupId);
  if (groupIds.length === 0) return [];
  const groups = await Promise.all(groupIds.map((gid) => getGroup(gid)));
  return groups.filter(Boolean);
};

export const getGroups = async () => {
  const snap = await getDocs(query(collection(db, "groups"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getGroup = async (groupId: string) => {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const deleteGroup = async (groupId: string) => {
  await deleteDoc(doc(db, "groups", groupId));
};

// Update any group field
export const updateGroup = async (groupId: string, data: Partial<GroupData>) => {
  await updateDoc(doc(db, "groups", groupId), { ...data });
};

export const updateGroupPlaces = async (
  groupId: string,
  places: Array<{ id: string; name: string; lat: number; lng: number }>
) => {
  await updateDoc(doc(db, "groups", groupId), { places });
};

// ==================== GROUP MEMBERS ====================
export const getGroupMembers = async (groupId: string) => {
  const snap = await getDocs(query(collection(db, "groupMembers"), where("groupId", "==", groupId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const joinGroup = async (groupId: string, userId: string, userName: string) => {
  await setDoc(doc(db, "groupMembers", `${groupId}_${userId}`), {
    groupId,
    userId,
    userName,
    role: "member",
    joinedAt: serverTimestamp(),
  });
};

export const leaveGroup = async (groupId: string, userId: string) => {
  await deleteDoc(doc(db, "groupMembers", `${groupId}_${userId}`));
};

export const removeMember = async (groupId: string, userId: string) => {
  await deleteDoc(doc(db, "groupMembers", `${groupId}_${userId}`));
};

// ==================== JOIN REQUESTS ====================
export const sendJoinRequest = async (groupId: string, userId: string, userName: string) => {
  await addDoc(collection(db, "joinRequests"), {
    groupId,
    userId,
    userName,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const getJoinRequests = async (groupId: string) => {
  const snap = await getDocs(
    query(collection(db, "joinRequests"), where("groupId", "==", groupId), where("status", "==", "pending"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const approveJoinRequest = async (requestId: string, groupId: string, userId: string, userName: string) => {
  await updateDoc(doc(db, "joinRequests", requestId), { status: "approved" });
  await joinGroup(groupId, userId, userName);
};

export const rejectJoinRequest = async (requestId: string) => {
  await updateDoc(doc(db, "joinRequests", requestId), { status: "rejected" });
};

// ==================== MESSAGES ====================
export const sendChatMessage = async (
  groupId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  text: string,
  type: "text" | "image" = "text"
) => {
  await addDoc(collection(db, "groups", groupId, "messages"), {
    userId,
    userName,
    userPhoto,
    text,
    type,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToChatMessages = (
  groupId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, "groups", groupId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
    callback(messages);
  });
};

// ==================== EXPENSES ====================
export const addExpense = async (
  groupId: string,
  description: string,
  amount: number,
  paidBy: string,
  paidByName: string
) => {
  await addDoc(collection(db, "groups", groupId, "expenses"), {
    description,
    amount,
    paidBy,
    paidByName,
    createdAt: serverTimestamp(),
  });
};

export const getExpenses = async (groupId: string) => {
  const snap = await getDocs(
    query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToExpenses = (
  groupId: string,
  callback: (expenses: Expense[]) => void
) => {
  const q = query(collection(db, "groups", groupId, "expenses"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
    callback(expenses);
  });
};
