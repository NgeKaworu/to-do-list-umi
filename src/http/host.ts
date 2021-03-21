export const mainHost = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://api.furan.xyz/flashcard';
    default:
      return 'http://localhost:8021';
  }
};
