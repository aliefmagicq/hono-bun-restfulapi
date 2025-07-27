import db from '../lib/db';

export const findUserByEmail = async (email: string) => {
  const findUser = await db.users.findFirst({
    where: { email },
  });

  if (!findUser) return null;
  return findUser;
};

export const findUserById = async (id: string) => {
  const findUser = await db.users.findUnique({
    where: { id },
  });

  if (!findUser) return null;
  return findUser;
};
