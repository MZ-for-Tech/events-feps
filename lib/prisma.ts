import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrismaPg = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrismaPg.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrismaPg.prisma = prisma;
