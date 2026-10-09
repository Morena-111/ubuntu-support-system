"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return userId;
}

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : null;
}

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();
  const firstName = getText(formData, "firstName")?.trim();
  const lastName = getText(formData, "lastName")?.trim();
  const phone = getText(formData, "phone")?.trim() ?? "";

  if (
    !firstName ||
    !lastName ||
    firstName.length > 80 ||
    lastName.length > 80 ||
    phone.length > 40
  ) {
    redirect("/settings?error=profile");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone: phone || null,
    },
  });

  revalidatePath("/settings");
  redirect("/settings?status=profile-saved");
}

export async function changePassword(formData: FormData) {
  const userId = await requireUserId();
  const currentPassword = getText(formData, "currentPassword");
  const newPassword = getText(formData, "newPassword");
  const confirmPassword = getText(formData, "confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/settings?error=password-required");
  }

  if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
    redirect("/settings?error=password-length");
  }

  if (newPassword !== confirmPassword) {
    redirect("/settings?error=password-mismatch");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    redirect("/settings?error=account-not-found");
  }

  const currentPasswordMatches = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!currentPasswordMatches) {
    redirect("/settings?error=current-password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: passwordHash },
  });

  revalidatePath("/settings");
  redirect("/settings?status=password-saved");
}

export async function updateNotificationPreference(formData: FormData) {
  const userId = await requireUserId();
  const enabled = formData.get("inAppNotificationsEnabled") === "on";

  await prisma.user.update({
    where: { id: userId },
    data: { inAppNotificationsEnabled: enabled },
  });

  revalidatePath("/settings");
  revalidatePath("/notifications");
  redirect("/settings?status=notifications-saved");
}
