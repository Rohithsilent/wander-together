export interface Group {
    id: string;
    destination: string;
    travelType: string;
    startDate: string;
    endDate: string;
    budget: string | number;
    maxMembers: number;
    isPrivate: boolean;
    description?: string;
    coverImage?: string;
    image?: string;
    places?: Place[];
    createdAt?: any;
    createdBy?: string;
}

export interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;
    [key: string]: any;
}

export interface Member {
    id: string;
    userId: string;
    userName: string;
    role: "admin" | "member";
    joinedAt?: any;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    paidByName: string;
    createdAt?: any;
}

export interface Message {
    id?: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    text: string;
    type: "text" | "image";
    createdAt?: any;
}

export interface JoinRequest {
    id: string;
    groupId: string;
    userId: string;
    userName: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: any;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}
