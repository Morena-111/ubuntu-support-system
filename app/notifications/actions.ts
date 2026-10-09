"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markNotificationRead(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be signed in to update notifications.");
  }

  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string" || !notificationId) {
    throw new Error("A notification ID is required.");
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be signed in to update notifications.");
  }

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}

export async function sendNotification(formData: FormData) {
  const session = await auth();
  const senderId = session?.user?.id;

  if (!senderId) {
    throw new Error("You must be signed in to send notifications.");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Only administrators can send notifications to other users.");
  }

  const recipientId = formData.get("recipientId");
  const title = formData.get("title");
  const message = formData.get("message");

  if (
    typeof recipientId !== "string" ||
    !recipientId ||
    typeof title !== "string" ||
    typeof message !== "string"
  ) {
    throw new Error("A recipient, title, and message are required.");
  }

  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedTitle || trimmedTitle.length > 120) {
    throw new Error("The title must be between 1 and 120 characters.");
  }

  if (!trimmedMessage || trimmedMessage.length > 2000) {
    throw new Error("The message must be between 1 and 2,000 characters.");
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: {
      id: true,
      inAppNotificationsEnabled: true,
    },
  });

  if (!recipient) {
    throw new Error("The selected recipient no longer exists.");
  }

  if (!recipient.inAppNotificationsEnabled) {
    redirect("/notifications?error=recipient-disabled");
  }

  await prisma.notification.create({
    data: {
      userId: recipient.id,
      title: trimmedTitle,
      message: trimmedMessage,
    },
  });

  revalidatePath("/notifications");
  redirect("/notifications?sent=1");
}
