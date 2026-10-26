import { z } from 'zod';

const short = z.string().trim().max(200);
const text = z.string().trim().max(2000);
const list = (max = 30) => z.array(short.min(1)).max(max);

export const sectionSchemas = {
  profile: z.object({
    firstName: short.min(1),
    lastName: short,
    eyebrow: short,
    lede: text,
    primaryCta: short,
    secondaryCta: short,
    badgeLabel: short,
    badgeText: short,
    badgeLive: z.boolean(),
  }),
  about: z.object({
    statement: text,
    workCaption: short,
    detailCaption: short,
  }),
  photos: z.object({
    portrait: z.string().nullable(),
    work: z.string().nullable(),
    detail: z.string().nullable(),
  }),
  experience: z.object({
    heading: short,
    roles: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]{1,40}$/),
          year: short,
          title: short.min(1),
          org: short,
          where: short,
          status: z.enum(['Running', 'Completed']),
          points: z.array(text.min(1)).max(12),
          tags: list(12),
        }),
      )
      .max(20),
  }),
  stack: z.object({
    heading: short,
    note: text,
    fileName: short,
    barRight: short,
    moduleName: short,
    scalars: z.array(z.object({ key: short.min(1), value: short })).max(10),
    groups: z.array(z.object({ key: short.min(1), values: list(20) })).max(20),
    comment: short,
  }),
  certifications: z.object({
    heading: short,
    items: z.array(z.object({ issuer: short.min(1), name: short })).max(20),
  }),
  education: z.object({
    items: z.array(z.object({ degree: short.min(1), school: short, details: text })).max(10),
  }),
  contact: z.object({
    headline: short,
    headlineAccent: short,
    email: z.string().trim().email().or(z.literal('')),
    phone: short,
    location: short,
    links: z
      .array(z.object({ label: short.min(1), url: z.string().trim().url().max(500) }))
      .max(10),
  }),
  seo: z.object({
    title: short,
    description: z.string().trim().max(300),
  }),
};

export const sectionNames = Object.keys(sectionSchemas);

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const passwordSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(10, 'Use at least 10 characters').max(200),
});
