"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!firstName || !lastName || !email || !password) {
    return {
      success: false,
      message: "All required fields must be completed.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Password must contain at least 8 characters.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "A user with this email already exists.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "BENEFICIARY",
    },
  });

  return {
    success: true,
    message: "Registration successful.",
  };
}