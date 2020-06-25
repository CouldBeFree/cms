const nodeExternals = require('webpack-node-externals');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

module.exports = {
  mode: 'universal',
  cache: true,
  devModules: [
    '@nuxtjs/vuetify'
  ],

  server: {
    port: 3000
  },
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    // '@biznestream/nuxt-base'
  ],
  axios: {
    proxy: true
  },
  auth: {
    redirect: {
      login: '/auth/signin',
      logout: '/',
      callback: '/auth/callback',
      home: '/'
    },

    fullPathRedirect: true,

    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/api/v1/auth/token',
            method: 'post',
            propertyName: 'token'
          },
          logout: false,
          user: {
            url: '/api/v1/auth/account',
            method: 'get',
            propertyName: 'account'
          }
        }
      }
    }
  },
  proxy: {
    '/api/v1': 'http://localhost:5000'
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'CMS',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable = no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/vuetify.js',
    '~/plugins/components.js',
    { src: '~/plugins/wysiwyg.js', ssr: false },
    { src: '~/plugins/codemirror.js', ssr: false },
    { src: '~/plugins/colors.js', ssr: false }
  ],
  css: [
    'codemirror/lib/codemirror.css',
    'codemirror/addon/fold/foldgutter.css',
    '~/assets/main.scss'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: ['aframe'],
    // transpile: [/^vuetify/],
    // plugins: [
    //   new VuetifyLoaderPlugin()
    // ],
    // loaders: {
    //   sass: {
    //     implementation: require('sass'),
    //     fiber: require('fibers'),
    //     indentedSyntax: true
    //   }
    // },
    babel: {
      presets({ isServer }) {
        const options = {
          useBuiltIns: "entry"
        };
        return [
          [ "@nuxt/babel-preset-app", options ]
        ]
      },
      plugins: [
        ['@babel/proposal-decorators', { legacy: true }],
        ['@babel/proposal-class-properties', { loose: true }]
      ]
    },
    extractCSS: true,
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.tmpl\.(html)(\?.*)?$/,
        loader: 'url-loader'
      });
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
      if (process.server) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/]
          })
        ];
      }
    }
  }
};
