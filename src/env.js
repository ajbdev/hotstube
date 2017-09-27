
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1
const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const isDev = isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))

let envConfig = { env: 'development' }


if (isDev) {
    envConfig = {
        env: 'development',
        url: 'http://localhost:8080'
    }
} else {
    envConfig = {
        env: 'production',
        url: 'http://hotstube.com/game/'
    }
}

module.exports = envConfig

