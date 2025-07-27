export const authConfig = {
  secret: Bun.env.JWT_SECRET as string,
  secretRefresh: Bun.env.JWT_SECRET_REFRESH as string,

  secretExpIn: Date.now() + 1000 * 60 * 15,
  secretRefreshExpIn: Date.now() + 1000 * 60 * 60 * 24,
};

export const appConfig = {
  host: null,
  port: null,
};
