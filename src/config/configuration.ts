export default () => ({
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
  expandVariables: true,
});
