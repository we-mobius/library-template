import { emptyDirSync, copyFileSync, rootResolvePath } from './utils.js'
import { getWebpackConfig } from '../webpack.config.js'
import webpack from 'webpack'
import path from 'path'
import chalk from 'chalk'

const BUILD_MODE = 'production'
const BUILD_TARGET_DES = 'dist'
const resolvePathInDes = (...paths) => path.join(BUILD_TARGET_DES, ...paths)

const empty = () => {
  return new Promise((resolve) => {
    emptyDirSync(rootResolvePath(BUILD_TARGET_DES))
    resolve()
  })
}

const webpackConfig = getWebpackConfig({ mode: BUILD_MODE })
console.info('【webpackConfig】' + JSON.stringify(webpackConfig))
const [webConfig] = webpackConfig

const packRenderer = () => {
  return new Promise((resolve, reject) => {
    console.log('【pack web】 start...')
    webpack(webConfig)
      .run((err, stats) => {
        // @see https://webpack.js.org/api/node/#error-handling
        if (err) {
          console.error(err.stack || err)
          if (err.details) {
            console.error(err.details)
          }
          return
        }

        const info = stats.toJson()

        if (stats.hasErrors()) {
          info.errors.forEach((error) => {
            console.log('Error: ', chalk(error.file))
            console.log(chalk(error.message))
            console.log('\r')
          })
        }

        if (stats.hasWarnings()) {
          info.warnings.forEach((warning) => {
            console.log('Warning: ', chalk(warning.file))
            console.log(chalk(warning.message))
            console.log('\r')
          })
        }

        console.log('【pack web】 complete!')

        resolve()
      })
  })
}

const copy = () => {
  return new Promise((resolve) => {
    console.log('【copy】 start...')
    copyFileSync(
      rootResolvePath('src/statics/images/thoughts-daily.png'),
      rootResolvePath(resolvePathInDes('statics/images/thoughts-daily.png'))
    )
    copyFileSync(
      rootResolvePath('src/statics/images/beian.png'),
      rootResolvePath(resolvePathInDes('statics/images/beian.png'))
    )
    console.log('【copy】 complete!')
    resolve()
  })
}

// execute
empty()
  .then(() => Promise.all([packRenderer()]))
  .then(() => copy())
  .then(() => {
    console.log(`${BUILD_MODE} Build Complete!!!`)
  })
