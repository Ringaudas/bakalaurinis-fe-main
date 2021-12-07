module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? 'https://ringaudas.github.io/bakalaurinis-fe-main/'
    : '/',
  transpileDependencies: [
    'vuetify'
  ]
}