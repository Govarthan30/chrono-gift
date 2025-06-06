export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface Gift {
  _id: string;
  senderId: string;
  receiverEmail: string;
  textMessage?: string;
  imageUrl?: string;
  videoUrl?: string;
  unlockTimestamp: string | number;
  isOpened: boolean;
  createdAt: string | number;
}
