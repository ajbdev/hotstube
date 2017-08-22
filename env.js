
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const isDev = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))


module.exports = isDev ? 'development' : 'production'

