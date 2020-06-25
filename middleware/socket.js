import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';

let isSocketInited = false;
export default ({ app, store }) => {
  if (!app.$auth.loggedIn || isSocketInited) {
    return;
  }
  isSocketInited = true;
  const protocol = location.protocol === 'http:' ? 'ws:' : 'wss:';

  const [, token] = (app.$auth.$storage._state['_token.local'] || '').split(' ');
  const vueSocket = new VueSocketIO({
    debug: false,
    connection: `${protocol}//${location.host}`,
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_',
      options: {
        useConnectionNamespace: true
      }
    },
    options: {
      path: '/api/v1/socket',
      query: { token }
    }
  });

  Vue.use(vueSocket);
};
