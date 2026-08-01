-- AlterTable
ALTER TABLE "ChatGroupMember" ADD COLUMN     "manager" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChatGroupBan" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "byId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatGroupBan_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateIndex
CREATE INDEX "ChatGroupBan_userId_idx" ON "ChatGroupBan"("userId");

-- CreateIndex
CREATE INDEX "ChatGroupMember_groupId_manager_idx" ON "ChatGroupMember"("groupId", "manager");

-- AddForeignKey
ALTER TABLE "ChatGroupBan" ADD CONSTRAINT "ChatGroupBan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroupBan" ADD CONSTRAINT "ChatGroupBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroupBan" ADD CONSTRAINT "ChatGroupBan_byId_fkey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
