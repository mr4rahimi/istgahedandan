-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DentistStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."DentistUserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "trackCode" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "categoryId" INTEGER,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "wpPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorName" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER,
    "externalLinksApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "wpTermId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dentist" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "address" TEXT,
    "phones" TEXT[],
    "socialLinks" JSONB,
    "workingHours" TEXT,
    "mapLat" DOUBLE PRECISION,
    "mapLng" DOUBLE PRECISION,
    "centerCode" TEXT,
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "public"."DentistStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "wpPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instagram" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,

    CONSTRAINT "Dentist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistLocation" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "show" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DentistLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistRegistration" (
    "id" SERIAL NOT NULL,
    "clinicName" TEXT NOT NULL,
    "doctorName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "message" TEXT,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DentistRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistSchedule" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "DentistSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistService" (
    "dentistId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "DentistService_pkey" PRIMARY KEY ("dentistId","serviceId")
);

-- CreateTable
CREATE TABLE "public"."DentistStory" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DentistStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "public"."DentistUserStatus" NOT NULL DEFAULT 'PENDING',
    "dentistId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DentistUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DentistVideo" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DentistVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FAQ" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER,
    "locationId" INTEGER,
    "serviceId" INTEGER,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "parentId" INTEGER,
    "wpPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "shortTitle" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" SERIAL NOT NULL,
    "dentistId" INTEGER,
    "serviceId" INTEGER,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wpCommentId" INTEGER,
    "parentId" INTEGER,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "shortDesc" TEXT,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "wpPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bgGradient" TEXT,
    "iconSvgPath" TEXT,
    "infoItems" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."StaticPage" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "wpPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "public"."AdminUser"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_trackCode_key" ON "public"."Appointment"("trackCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_wpPostId_key" ON "public"."BlogPost"("wpPostId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Category_wpTermId_key" ON "public"."Category"("wpTermId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Dentist_slug_key" ON "public"."Dentist"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Dentist_wpPostId_key" ON "public"."Dentist"("wpPostId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DentistLocation_dentistId_locationId_key" ON "public"."DentistLocation"("dentistId" ASC, "locationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DentistSchedule_dentistId_date_key" ON "public"."DentistSchedule"("dentistId" ASC, "date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DentistUser_dentistId_key" ON "public"."DentistUser"("dentistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DentistUser_email_key" ON "public"."DentistUser"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "public"."Location"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Location_wpPostId_key" ON "public"."Location"("wpPostId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_wpCommentId_key" ON "public"."Review"("wpCommentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "public"."Service"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Service_wpPostId_key" ON "public"."Service"("wpPostId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_slug_key" ON "public"."StaticPage"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_wpPostId_key" ON "public"."StaticPage"("wpPostId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."DentistUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistLocation" ADD CONSTRAINT "DentistLocation_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistLocation" ADD CONSTRAINT "DentistLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistSchedule" ADD CONSTRAINT "DentistSchedule_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistService" ADD CONSTRAINT "DentistService_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistService" ADD CONSTRAINT "DentistService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistStory" ADD CONSTRAINT "DentistStory_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistUser" ADD CONSTRAINT "DentistUser_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DentistVideo" ADD CONSTRAINT "DentistVideo_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAQ" ADD CONSTRAINT "FAQ_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "public"."Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

