<template>
  <div class="output-pan">

    <div class="pan-head">
      Output

      <span>
      {{currentDevice.width}}x{{currentDevice.height}}
      </span>
    </div>
    <div class="output-iframe" id="output-iframe">

      <div id="output-iframe-holder" :style="currentDevice"></div>

      <div class="output-loading-layer" v-if="loading">Loading</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .output-pan {
    position: absolute;
    overflow: hidden;
    top: 0;
    bottom: 0;
  }
  .output-iframe {
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
    position: relative;

    &.disable-mouse-events {
      pointer-events: none;
    }
  }
  .output-loading-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, .5);
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import createIframe from '~/utils/iframe';

  const { State } = namespace('pans');

  const sandboxAttributes = [
    'allow-modals',
    'allow-forms',
    'allow-pointer-lock',
    'allow-popups',
    'allow-same-origin',
    'allow-scripts'
  ];

  const replaceQuote = str => str.replace(/__QUOTE_LEFT__/g, '<');

  const createElement = tag => (content = '', attrs = {}) => {
    attrs = Object.keys(attrs)
      .map(key => {
        return `${key}="${attrs[key]}"`;
      })
      .join(' ');
    return replaceQuote(
      `__QUOTE_LEFT__${tag} ${attrs}>${content}__QUOTE_LEFT__/${tag}>`
    );
  };

  export default @Component({
    components: {}
  })
  class OutputEditor extends Vue {
    @Prop({ default: '-' }) htmlCode;

    @Prop() cssCode;

    @Prop() loading;

    @State currentDevice;

    async mounted () {
      this.iframe = createIframe({
        el: document.getElementById('output-iframe-holder'),
        sandboxAttributes
      });

      window.addEventListener('message', this.listenIframe);

      this.run(this.code);
    }

    beforeDestroy () {
      window.removeEventListener('message', this.listenIframe);
    }

    async listenIframe ({ data = {} }) {
      console.info(data);
      if (data.type === 'iframe-error') {
        // this.addLog({ type: 'error', message: data.message.trim() });
        // this.setIframeStatus('error');
      } else if (data.type === 'codepan-console') {
        // if (data.method === 'clear') {
        //   this.clearLogs();
        // } else {
        //   this.addLog({ type: data.method, message: data.args.join('\\n') });
        // }
      } else if (data.type === 'codepan-make-output-active') {

      } else if (data.type === 'codepan-set-boilerplate' && data.boilerplate) {

      } else if (data.type === 'iframe-success') {

      }
    }

    @Watch('htmlCode')
    onHtmlChanged () {
      this.run();
    }

    @Watch('cssCode')
    onCssChanged () {
      this.run();
    }

    async run () {
      let js = '';
      let html = this.htmlCode;
      let css = this.cssCode;

      try {
        js = js.replace(/<\/script>/, '<\\/script>');
        js = `
          if (window.Vue) {
            window.Vue.config.productionTip = false;
          }
          // console.clear();
          document.addEventListener('DOMContentLoaded', __executeCodePan);
          function __executeCodePan(){
            window.parent.postMessage({ type: 'iframe-success' }, '*');
            try {
              ${js}
            } catch (err) {
              window.parent.postMessage({
                type: 'iframe-error',
                message: err.frame ? err.message + '\\n' + err.frame : err.stack
              }, '*');
            }
          };`;
      } catch (err) {
        // return this.addLog({
        //   type: 'error',
        //   message: err.frame ? `${err.message}\n${err.frame}` : err.stack
        // })
      }

      const headStyle = createElement('style')(css);
      const codePanRuntime = createElement('script')(`window.process = window.process || { env: { NODE_ENV: 'development' } }`);
      // createElement('script')(proxyConsole)
      const head = headStyle + codePanRuntime;
      const body = html + createElement('script')(js);

      this.iframe.setHTML({ head, body });
    }

    @Watch('currentDevice')
    onDeviceChanged (val) {
      this.iframe.setStyle(val);
    }
  }
</script>
