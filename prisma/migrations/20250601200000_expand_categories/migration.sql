-- Income categories
CREATE TYPE "IncomeCategory" AS ENUM (
  'SALARY',
  'FREELANCE',
  'INVESTMENT',
  'BUSINESS',
  'RENTAL_INCOME',
  'BONUS',
  'GIFT',
  'REFUND',
  'DIVIDENDS',
  'OTHER'
);

ALTER TABLE "Income" ADD COLUMN "category" "IncomeCategory" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "Income" ALTER COLUMN "source" DROP NOT NULL;

-- Expense categories (replace enum)
CREATE TYPE "ExpenseCategory_new" AS ENUM (
  'RENT',
  'MORTGAGE',
  'WATER',
  'ELECTRICITY',
  'GAS',
  'INTERNET',
  'TV',
  'HOME_MAINTENANCE',
  'GROCERIES',
  'RESTAURANTS',
  'COFFEE',
  'DELIVERY',
  'FUEL',
  'PUBLIC_TRANSIT',
  'RIDE_SHARE',
  'PARKING',
  'CAR_MAINTENANCE',
  'CLOTHES',
  'ELECTRONICS',
  'GYM',
  'SUBSCRIPTION',
  'ENTERTAINMENT',
  'PERSONAL_CARE',
  'HEALTH',
  'UTILITIES',
  'EDUCATION',
  'GIFTS',
  'TAXES',
  'FEES',
  'OTHER'
);

ALTER TABLE "Expense" ADD COLUMN "category_new" "ExpenseCategory_new";

UPDATE "Expense" SET "category_new" = CASE "category"::text
  WHEN 'HOUSING' THEN 'RENT'::"ExpenseCategory_new"
  WHEN 'FOOD' THEN 'GROCERIES'::"ExpenseCategory_new"
  WHEN 'TRANSPORT' THEN 'FUEL'::"ExpenseCategory_new"
  WHEN 'UTILITIES' THEN 'UTILITIES'::"ExpenseCategory_new"
  WHEN 'ENTERTAINMENT' THEN 'ENTERTAINMENT'::"ExpenseCategory_new"
  WHEN 'HEALTH' THEN 'HEALTH'::"ExpenseCategory_new"
  ELSE 'OTHER'::"ExpenseCategory_new"
END;

ALTER TABLE "Expense" DROP COLUMN "category";
ALTER TABLE "Expense" RENAME COLUMN "category_new" TO "category";
ALTER TABLE "Expense" ALTER COLUMN "category" SET NOT NULL;

DROP TYPE "ExpenseCategory";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
