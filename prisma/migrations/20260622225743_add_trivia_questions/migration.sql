-- CreateTable
CREATE TABLE "TriviaQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textEn" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textFr" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "explanation" TEXT,
    "explanationAr" TEXT,
    "explanationFr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
