import Database from 'better-sqlite3';
import { prisma as pgClient } from '../lib/prisma';
import path from 'path';

// Helper to convert SQLite values to Postgres/Prisma expected values
function mapRow(row: any) {
  const mapped: any = { ...row };
  for (const [key, value] of Object.entries(mapped)) {
    if (value === null) continue;
    
    // SQLite booleans are often stored as 1 or 0 by Prisma
    if (key === 'published' || key === 'surveyEnabled') {
      mapped[key] = value === 1;
    }
    
    // DateTimes are stored as strings or unix timestamps in SQLite by Prisma
    // The keys can be identified since they usually end with 'Date' or 'At'
    if (key === 'startDate' || key === 'endDate' || key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
      mapped[key] = new Date(value as string | number);
    }
  }
  return mapped;
}

async function main() {
  const sqliteDbPath = path.resolve(process.cwd(), 'prisma', 'feps-events.db');
  console.log('🔗 Opening SQLite DB at:', sqliteDbPath);
  const db = new Database(sqliteDbPath, { readonly: true });

  console.log('📥 Fetching data from SQLite...');
  const users = db.prepare('SELECT * FROM User').all().map(mapRow);
  const eventCategories = db.prepare('SELECT * FROM EventCategory').all().map(mapRow);
  const triviaCategories = db.prepare('SELECT * FROM TriviaCategory').all().map(mapRow);
  const events = db.prepare('SELECT * FROM Event').all().map(mapRow);
  const triviaQuestions = db.prepare('SELECT * FROM TriviaQuestion').all().map(mapRow);
  const auditLogs = db.prepare('SELECT * FROM AuditLog').all().map(mapRow);
  const surveyResponses = db.prepare('SELECT * FROM SurveyResponse').all().map(mapRow);

  console.log(`📦 Found: ${users.length} Users, ${eventCategories.length} Event Categories, ${events.length} Events...`);

  db.close();

  console.log('🧹 Wiping PostgreSQL database...');
  await pgClient.triviaQuestion.deleteMany();
  await pgClient.triviaCategory.deleteMany();
  await pgClient.surveyResponse.deleteMany();
  await pgClient.event.deleteMany();
  await pgClient.eventCategory.deleteMany();
  await pgClient.auditLog.deleteMany();
  await pgClient.user.deleteMany();

  console.log('📤 Inserting data into PostgreSQL...');
  
  if (users.length > 0) { await pgClient.user.createMany({ data: users }); console.log('✅ Users inserted'); }
  if (eventCategories.length > 0) { await pgClient.eventCategory.createMany({ data: eventCategories }); console.log('✅ Event Categories inserted'); }
  if (triviaCategories.length > 0) { await pgClient.triviaCategory.createMany({ data: triviaCategories }); console.log('✅ Trivia Categories inserted'); }
  if (events.length > 0) { await pgClient.event.createMany({ data: events }); console.log('✅ Events inserted'); }
  if (triviaQuestions.length > 0) { await pgClient.triviaQuestion.createMany({ data: triviaQuestions }); console.log('✅ Trivia Questions inserted'); }
  if (surveyResponses.length > 0) { await pgClient.surveyResponse.createMany({ data: surveyResponses }); console.log('✅ Survey Responses inserted'); }
  if (auditLogs.length > 0) { await pgClient.auditLog.createMany({ data: auditLogs }); console.log('✅ Audit Logs inserted'); }

  console.log('🎉 Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
