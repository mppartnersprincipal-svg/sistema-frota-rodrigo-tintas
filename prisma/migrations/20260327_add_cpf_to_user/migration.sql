-- Adiciona coluna cpf com valor temporário para linhas existentes (dados de seed)
ALTER TABLE "User" ADD COLUMN "cpf" TEXT NOT NULL DEFAULT '';

-- Remove o pin como campo único (login passa a ser cpf + pin)
-- SQLite não suporta DROP CONSTRAINT, recria a tabela

-- Atualiza CPFs dos usuários de seed existentes
UPDATE "User" SET "cpf" = '00000000000' WHERE "pin" = '0000';
UPDATE "User" SET "cpf" = '11111111111' WHERE "pin" = '1234';
UPDATE "User" SET "cpf" = '22222222222' WHERE "pin" = '5678';

-- Remove o default temporário (SQLite não suporta ALTER COLUMN, mas o Prisma
-- vai validar via aplicação — o campo já ficará sem default no schema)

-- Cria índice único no cpf
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- Remove o índice único antigo do pin (login agora é cpf+pin)
DROP INDEX IF EXISTS "User_pin_key";
