export const mainHost = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://api.furan.xyz/to-do-list';
    default:
      return 'http://localhost:8041';
  }
};
