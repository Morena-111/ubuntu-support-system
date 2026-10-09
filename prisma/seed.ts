import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  CampaignStatus,
  DonationStatus,
  RequestCategory,
  RequestStatus,
  Role,
  VolunteerStatus,
} from "../app/generated/prisma/enums";
import { prisma } from "../lib/prisma";

const ids = {
  campaigns: [
    "10000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000002",
    "10000000-0000-4000-8000-000000000003",
  ],
  requests: [
    "20000000-0000-4000-8000-000000000001",
    "20000000-0000-4000-8000-000000000002",
    "20000000-0000-4000-8000-000000000003",
    "20000000-0000-4000-8000-000000000004",
    "20000000-0000-4000-8000-000000000005",
    "20000000-0000-4000-8000-000000000006",
    "20000000-0000-4000-8000-000000000007",
    "20000000-0000-4000-8000-000000000008",
  ],
  donations: [
    "30000000-0000-4000-8000-000000000001",
    "30000000-0000-4000-8000-000000000002",
    "30000000-0000-4000-8000-000000000003",
    "30000000-0000-4000-8000-000000000004",
    "30000000-0000-4000-8000-000000000005",
  ],
  assignments: [
    "40000000-0000-4000-8000-000000000001",
    "40000000-0000-4000-8000-000000000002",
    "40000000-0000-4000-8000-000000000003",
    "40000000-0000-4000-8000-000000000004",
  ],
  reports: [
    "50000000-0000-4000-8000-000000000001",
    "50000000-0000-4000-8000-000000000002",
    "50000000-0000-4000-8000-000000000003",
    "50000000-0000-4000-8000-000000000004",
    "50000000-0000-4000-8000-000000000005",
    "50000000-0000-4000-8000-000000000006",
  ],
  notifications: [
    "60000000-0000-4000-8000-000000000001",
    "60000000-0000-4000-8000-000000000002",
    "60000000-0000-4000-8000-000000000003",
  ],
  activity: [
    "70000000-0000-4000-8000-000000000001",
    "70000000-0000-4000-8000-000000000002",
    "70000000-0000-4000-8000-000000000003",
    "70000000-0000-4000-8000-000000000004",
  ],
};

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function ensureDemoAccount({
  firstName,
  lastName,
  email,
  role,
}: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existingUser) {
    if (existingUser.role !== role) {
      throw new Error(
        `Cannot create ${role} demo account: ${email} already belongs to a ${existingUser.role} account.`
      );
    }
    return null;
  }

  const temporaryPassword = randomBytes(18).toString("base64url");
  const password = await bcrypt.hash(temporaryPassword, 12);
  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password,
      role,
      inAppNotificationsEnabled: true,
    },
  });

  return { email, temporaryPassword };
}

async function main() {
  const createdDemoAccounts = [];
  for (const account of [
    {
      firstName: "Demo",
      lastName: "Donor",
      email: "demo.donor@ubuntu-support.test",
      role: Role.DONOR,
    },
    {
      firstName: "Demo",
      lastName: "Volunteer",
      email: "demo.volunteer@ubuntu-support.test",
      role: Role.VOLUNTEER,
    },
  ]) {
    const created = await ensureDemoAccount(account);
    if (created) createdDemoAccounts.push(created);
  }

  const [beneficiaries, donors, volunteers, allUsers] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.BENEFICIARY },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, inAppNotificationsEnabled: true },
    }),
    prisma.user.findMany({
      where: { role: Role.DONOR },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { role: Role.VOLUNTEER },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    }),
    prisma.user.findMany({
      orderBy: { id: "asc" },
      select: { id: true, inAppNotificationsEnabled: true },
    }),
  ]);

  if (beneficiaries.length === 0) {
    throw new Error(
      "Seed requires at least one existing BENEFICIARY account. No accounts will be created."
    );
  }

  const campaigns = [
    {
      id: ids.campaigns[0],
      title: "Winter Essentials Drive",
      description: "Clothing and household support for families this winter.",
      startDate: daysAgo(95),
      status: CampaignStatus.COMPLETED,
      endDate: daysAgo(35),
    },
    {
      id: ids.campaigns[1],
      title: "School Ready Initiative",
      description: "Shoes and learning materials for local learners.",
      startDate: daysAgo(45),
      status: CampaignStatus.ACTIVE,
      endDate: null,
    },
    {
      id: ids.campaigns[2],
      title: "Community Food Support",
      description: "Food parcels for households experiencing food insecurity.",
      startDate: daysAgo(20),
      status: CampaignStatus.ACTIVE,
      endDate: null,
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: { id: campaign.id },
      update: campaign,
      create: campaign,
    });
  }

  const requestData = [
    {
      title: "School shoes for Grade 7 learners",
      description: "Durable school shoes for learners who need support.",
      category: RequestCategory.EDUCATION,
      status: RequestStatus.MATCHED,
      quantityNeeded: 30,
      days: 2,
    },
    {
      title: "Food parcel support",
      description: "Monthly food parcels for local households.",
      category: RequestCategory.FOOD,
      status: RequestStatus.APPROVED,
      quantityNeeded: 25,
      days: 5,
    },
    {
      title: "Computer equipment for the learning centre",
      description: "Refurbished laptops to support after-school learning.",
      category: RequestCategory.TECHNOLOGY,
      status: RequestStatus.PENDING,
      quantityNeeded: 8,
      days: 8,
    },
    {
      title: "Winter clothing for families",
      description: "Warm clothing in a range of children's and adult sizes.",
      category: RequestCategory.CLOTHING,
      status: RequestStatus.COMPLETED,
      quantityNeeded: 40,
      days: 14,
    },
    {
      title: "Hygiene packs for young people",
      description: "Essential hygiene items for youth in the community.",
      category: RequestCategory.HEALTH,
      status: RequestStatus.PENDING,
      quantityNeeded: 20,
      days: 19,
    },
    {
      title: "Stationery for a community classroom",
      description: "Exercise books and basic classroom stationery.",
      category: RequestCategory.EDUCATION,
      status: RequestStatus.APPROVED,
      quantityNeeded: 60,
      days: 38,
    },
    {
      title: "Beds and blankets for a family shelter",
      description: "Basic bedding for families moving into temporary shelter.",
      category: RequestCategory.FURNITURE,
      status: RequestStatus.MATCHED,
      quantityNeeded: 12,
      days: 72,
    },
    {
      title: "Fresh food boxes",
      description: "Fresh produce boxes for older residents.",
      category: RequestCategory.FOOD,
      status: RequestStatus.COMPLETED,
      quantityNeeded: 18,
      days: 145,
    },
  ] as const;

  const requests = [];
  for (const [index, request] of requestData.entries()) {
    const { days, ...requestFields } = request;
    const createdAt = daysAgo(days);
    const data = {
      ...requestFields,
      createdAt,
      updatedAt: createdAt,
      beneficiaryId: beneficiaries[index % beneficiaries.length].id,
    };
    requests.push(
      await prisma.donationRequest.upsert({
        where: { id: ids.requests[index] },
        update: data,
        create: { id: ids.requests[index], ...data },
      })
    );
  }

  let donationCount = 0;
  let assignmentCount = 0;
  if (donors.length > 0) {
    const donationData = [
      { status: DonationStatus.IN_TRANSIT, quantityDonated: 20, days: 1 },
      { status: DonationStatus.PENDING, quantityDonated: 10, days: 4 },
      { status: DonationStatus.COLLECTED, quantityDonated: 8, days: 7 },
      { status: DonationStatus.DELIVERED, quantityDonated: 35, days: 13 },
      { status: DonationStatus.DELIVERED, quantityDonated: 16, days: 37 },
    ];

    for (const [index, donation] of donationData.entries()) {
      const createdAt = daysAgo(donation.days);
      const data = {
        status: donation.status,
        quantityDonated: donation.quantityDonated,
        donorId: donors[index % donors.length].id,
        requestId: requests[index].id,
        createdAt,
        updatedAt: createdAt,
      };
      await prisma.donation.upsert({
        where: { id: ids.donations[index] },
        update: data,
        create: { id: ids.donations[index], ...data },
      });
    }
    donationCount = donationData.length;

    if (volunteers.length > 0) {
      const volunteerStatuses = [
        VolunteerStatus.IN_TRANSIT,
        VolunteerStatus.DELIVERED,
        VolunteerStatus.DELIVERED,
        VolunteerStatus.ASSIGNED,
      ];
      const eligibleDonations = await prisma.donation.findMany({
        where: { id: { in: ids.donations.slice(0, 4) } },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      for (const [index, donation] of eligibleDonations.entries()) {
        const data = {
          donationId: donation.id,
          volunteerId: volunteers[index % volunteers.length].id,
          status: volunteerStatuses[index],
          pickupDate: daysAgo(Math.max(0, 3 - index)),
          deliveryDate:
            volunteerStatuses[index] === VolunteerStatus.DELIVERED
              ? daysAgo(Math.max(0, 2 - index))
              : null,
        };
        await prisma.volunteerAssignment.upsert({
          where: { donationId: donation.id },
          update: data,
          create: { id: ids.assignments[index], ...data },
        });
      }
      assignmentCount = eligibleDonations.length;
    }
  }

  const impactData = [
    {
      beneficiariesSupported: 24,
      donationsReceived: 31,
      volunteersInvolved: 6,
      days: 3,
      campaignIndex: 2,
    },
    {
      beneficiariesSupported: 18,
      donationsReceived: 22,
      volunteersInvolved: 5,
      days: 9,
      campaignIndex: 1,
    },
    {
      beneficiariesSupported: 32,
      donationsReceived: 40,
      volunteersInvolved: 8,
      days: 21,
      campaignIndex: 2,
    },
    {
      beneficiariesSupported: 27,
      donationsReceived: 35,
      volunteersInvolved: 7,
      days: 44,
      campaignIndex: 1,
    },
    {
      beneficiariesSupported: 41,
      donationsReceived: 48,
      volunteersInvolved: 10,
      days: 80,
      campaignIndex: 0,
    },
    {
      beneficiariesSupported: 20,
      donationsReceived: 26,
      volunteersInvolved: 4,
      days: 175,
      campaignIndex: 0,
    },
  ];

  for (const [index, report] of impactData.entries()) {
    const data = {
      campaignId: ids.campaigns[report.campaignIndex],
      beneficiariesSupported: report.beneficiariesSupported,
      donationsReceived: report.donationsReceived,
      volunteersInvolved: report.volunteersInvolved,
      reportDate: daysAgo(report.days),
    };
    await prisma.impactReport.upsert({
      where: { id: ids.reports[index] },
      update: data,
      create: { id: ids.reports[index], ...data },
    });
  }

  const notificationMessages = [
    {
      title: "Welcome to Ubuntu Support",
      message:
        "Your account is ready. You can follow community support requests and updates here.",
      days: 2,
      isRead: false,
    },
    {
      title: "A request needs community support",
      message:
        "School shoes for Grade 7 learners is now matched with a contribution.",
      days: 6,
      isRead: false,
    },
    {
      title: "Community update",
      message:
        "The Winter Essentials Drive has completed. Thank you for being part of the support network.",
      days: 32,
      isRead: true,
    },
  ];
  let notificationCount = 0;
  const notificationUsers = allUsers
    .filter((user) => user.inAppNotificationsEnabled)
    .slice(0, ids.notifications.length);
  for (const [index, user] of notificationUsers.entries()) {
    const notification = notificationMessages[index];
    const data = {
      userId: user.id,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: daysAgo(notification.days),
    };
    await prisma.notification.upsert({
      where: { id: ids.notifications[index] },
      update: data,
      create: {
        id: ids.notifications[index],
        ...data,
      },
    });
    notificationCount += 1;
  }

  const actions = [
    { action: "submitted", entity: "DonationRequest", days: 2 },
    { action: "updated", entity: "DonationRequest", days: 8 },
    { action: "completed", entity: "DonationRequest", days: 14 },
    { action: "submitted", entity: "DonationRequest", days: 38 },
  ];
  for (const [index, activity] of actions.entries()) {
    const data = {
      userId: beneficiaries[index % beneficiaries.length].id,
      action: activity.action,
      entity: activity.entity,
      entityId: requests[index].id,
      timestamp: daysAgo(activity.days),
    };
    await prisma.activityLog.upsert({
      where: { id: ids.activity[index] },
      update: data,
      create: { id: ids.activity[index], ...data },
    });
  }

  console.log(
    `Seed complete: ${requests.length} requests, ${campaigns.length} campaigns, ${impactData.length} impact reports, ${notificationCount} notifications, ${actions.length} activity logs, ${donationCount} donations, and ${assignmentCount} volunteer assignments.`
  );
  if (donors.length === 0) {
    console.log(
      "Donations were skipped because there are no existing DONOR accounts."
    );
  }
  if (volunteers.length === 0) {
    console.log(
      "Volunteer assignments were skipped because there are no existing VOLUNTEER accounts."
    );
  }
  if (createdDemoAccounts.length > 0) {
    console.log(
      "Temporary passwords for newly created demo accounts (save these now; only password hashes are stored):"
    );
    for (const account of createdDemoAccounts) {
      console.log(`${account.email}: ${account.temporaryPassword}`);
    }
  } else {
    console.log(
      "Demo accounts already existed; their passwords were not changed."
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
