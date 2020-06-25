class Transformers {
  constructor () {
    this.map = {};
  }

  set (k, v) {
    this.map[k] = v;
  }

  get (k) {
    return this.map[k];
  }
}

export
const transformers = new Transformers();

export
async function loadSass () {
  if (!transformers.get('sass')) {
    transformers.set('sass', {});
    // progress.start();
    const [{ default: Sass }] = await Promise.all([
      import('../static/node_modules/sass/sass'),
      import(/* webpackChunkName: "codemirror-mode" */ 'codemirror/mode/sass/sass.js')
    ]);
    const sass = new Sass('/node_modules/sass/sass.worker.js');

    return new Promise((resolve, reject) => {
      sass.preloadFiles('/node_modules/bootstrap/scss', 'bootstrap/scss', [
        '_functions.scss',
        '_variables.scss',
        '_reboot.scss',
        '_type.scss',
        '_images.scss',
        '_grid.scss',
        '_buttons.scss',
        '_nav.scss',
        '_navbar.scss',
        '_dropdown.scss',
        '_utilities.scss',
        '_forms.scss',
        'mixins/_hover.scss',
        'mixins/_breakpoints.scss',
        'mixins/_badge.scss',
        'mixins/_resize.scss',
        'mixins/_screen-reader.scss',
        'mixins/_size.scss',
        'mixins/_reset-text.scss',
        'mixins/_text-emphasis.scss',
        'mixins/_text-hide.scss',
        'mixins/_text-truncate.scss',
        'mixins/_image.scss',
        'mixins/_visibility.scss',
        'mixins/_alert.scss',
        'mixins/_buttons.scss',
        'mixins/_caret.scss',
        'mixins/_pagination.scss',
        'mixins/_lists.scss',
        'mixins/_list-group.scss',
        'mixins/_nav-divider.scss',
        'mixins/_forms.scss',
        'mixins/_table-row.scss',
        'mixins/_background-variant.scss',
        'mixins/_border-radius.scss',
        'mixins/_box-shadow.scss',
        'mixins/_gradients.scss',
        'mixins/_transition.scss',
        'mixins/_clearfix.scss',
        'mixins/_grid-framework.scss',
        'mixins/_grid.scss',
        'mixins/_float.scss',
        'utilities/_align.scss',
        'utilities/_background.scss',
        'utilities/_borders.scss',
        'utilities/_clearfix.scss',
        'utilities/_display.scss',
        'utilities/_embed.scss',
        'utilities/_flex.scss',
        'utilities/_float.scss',
        'utilities/_overflow.scss',
        'utilities/_position.scss',
        'utilities/_screenreaders.scss',
        'utilities/_shadows.scss',
        'utilities/_sizing.scss',
        'utilities/_spacing.scss',
        'utilities/_text.scss',
        'utilities/_visibility.scss',
        '_mixins.scss'
      ], () => {
        transformers.set('sass', sass);
        resolve();
      });
    });
    // progress.done();
  }
}
