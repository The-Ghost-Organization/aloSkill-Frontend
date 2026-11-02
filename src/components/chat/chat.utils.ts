export type Person = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
};
export type Message = {
  id: string;
  clientId?: string | null;
  conversationId: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: Person;
  state?: "sending" | "failed";
  error?: string;
};
export type Conversation = {
  id: string;
  participant: Person | null;
  lastMessageAt: string | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  participantLastReadAt?: string | null;
};
export type MessagePage = { items: Message[]; nextCursor: string | null };
export type DeletedMessage = {
  id: string;
  conversationId: string;
  deletedAt: string;
};

/** Merge both HTTP and socket deliveries, retaining one confirmed row per client request. */
export function mergeMessages(
  current: Message[],
  incoming: Message[],
  deleted: ReadonlySet<string> = new Set(),
) {
  const result = [...current];
  for (const message of incoming) {
    const index = result.findIndex(
      (item) =>
        item.id === message.id ||
        Boolean(
          message.clientId &&
          item.clientId === message.clientId &&
          item.senderId === message.senderId,
        ),
    );
    if (index < 0) result.push(message);
    else if (!message.state || result[index]?.state) result[index] = message;
  }
  return result
    .filter((item) => !deleted.has(`${item.conversationId}:${item.id}`))
    .sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
    );
}
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}
export function personRole(person?: Person | null) {
  return person?.roles.includes("INSTRUCTOR")
    ? "Instructor"
    : person?.roles.includes("STUDENT")
      ? "Student"
      : "Member";
}
export function dayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  });
}
export function inboxTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toDateString() === new Date().toDateString()
    ? timeLabel(value)
    : date.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
}
