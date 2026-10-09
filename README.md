# Ubuntu Support System

## Research Title

Evaluation of Web Development Frameworks Using the Ubuntu Support System

## Framework

Next.js

---

## Purpose

This repository contains the implementation artefact developed as part of a research study evaluating the effectiveness of the Next.js web development framework.

---

## Research Objectives

- Evaluate development efficiency
- Evaluate framework usability
- Measure performance
- Assess LLM-assisted development
- Compare implementation outcomes

---

## Technology Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- GitHub Copilot

---

## Development Methodology

Design Science Research (DSR)

Experimental Evaluation

---

## Populate development data

After applying the database migrations, run:

```bash
npx prisma db seed
```

The seed is safe to rerun and does not delete existing records or create user
accounts other than two clearly marked demo accounts: `demo.donor@ubuntu-support.test`
and `demo.volunteer@ubuntu-support.test`. On first creation, it prints a unique
temporary password for each; save those passwords, since only their hashes are
stored and reruns will not reset or print them again. The seed uses existing
beneficiary accounts for sample requests and adds sample donations and volunteer
assignments for the demo accounts.
