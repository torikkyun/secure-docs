-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "google_id" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "wallet_address" VARCHAR(42),
    "public_key" VARCHAR(66),
    "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "sha256_hash" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sharing_events" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "ledger_id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "tag" TEXT,
    "note" VARCHAR(500),

    CONSTRAINT "sharing_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "event_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ledger_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ledger_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."key_stores" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "key_stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "public"."user_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_statuses_name_key" ON "public"."user_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "public"."users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_statuses_name_key" ON "public"."event_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_types_name_key" ON "public"."ledger_types"("name");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."user_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."event_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "public"."ledger_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sharing_events" ADD CONSTRAINT "sharing_events_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."key_stores" ADD CONSTRAINT "key_stores_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."key_stores" ADD CONSTRAINT "key_stores_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
