<template>

  <div class="pan-resizer" :class="{ enable }" ref="resizer" @mousedown="handleMouseDown">
  </div>

</template>
<style lang="scss" scoped>
  .pan-resizer {
    width: 5px;
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    border-right: 1px solid #e2e2e2;
    z-index: 5;

    &.enable:hover {
      cursor: move;
      border-right: 1px dashed #39f;
    }
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';
  import Event from '~/utils/event';
  import { ALL_PANS } from '~/store/pans';

  const { State } = namespace('pans');

  export default @Component({
    components: {}
  })
  class PanResizer extends Vue {
    @Prop() enable;

    @Prop() pan;

    @State visiblePans;

    resizing = false;

    originalNextPanLeft = null;

    originalNextPanRight = null;

    originalCurrentPanRight = null;

    originalCurrentPanLeft = null;

    currentPan = null;

    nextPan = null;

    get nextPanName () {
      let currentIndex = ALL_PANS.indexOf(this.pan);
      let nextPan = ALL_PANS[++currentIndex];
      while (this.visiblePans.indexOf(nextPan) === -1 && nextPan) {
        nextPan = ALL_PANS[++currentIndex];
      }
      return nextPan;
    }

    updateNextPan (style) {
      Event.$emit(`set-${this.nextPanName}-pan-style`, style);
    }

    updateCurrentPan (style) {
      Event.$emit(`set-${this.pan}-pan-style`, style);
    }

    getNextVisiblePan (current) {
      const next = current.nextElementSibling;
      if (next && next.style.display === 'none') {
        return this.getNextVisiblePan(next);
      }
      return next;
    }

    handleMouseDown () {
      this.resizing = true;
      this.currentPan = this.$refs.resizer.parentNode;
      this.nextPan = this.getNextVisiblePan(this.currentPan);
      this.originalNextPanLeft = parseFloat(this.nextPan.style.left || 0);
      this.originalNextPanRight = parseFloat(this.nextPan.style.right || 0);
      this.originalCurrentPanRight = parseFloat(this.currentPan.style.right || 0);
      this.originalCurrentPanLeft = parseFloat(this.currentPan.style.left || 0);

      console.info(this.nextPan);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      this.currentPan.parentNode.classList.add('resizing');
      document.getElementById('output-iframe').classList.add('disable-mouse-events');
    }

    handleMouseUp () {
      this.resizing = false;
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      this.currentPan.parentNode.classList.remove('resizing');
      document.getElementById('output-iframe').classList.remove('disable-mouse-events');
      Event.$emit('refresh-editor', { run: false });
    }

    handleMouseMove (e) {
      if (this.resizing) {
        e.preventDefault();
        const newNextPanLeft = e.clientX / window.innerWidth * 100;
        if (
          (newNextPanLeft - this.originalCurrentPanLeft > 5) &&
          (100 - newNextPanLeft - this.originalNextPanRight > 5)
        ) {
          this.updateNextPan({ left: `${newNextPanLeft}%` });
          const newCurrentPanRight = this.originalCurrentPanRight - (newNextPanLeft - this.originalNextPanLeft);
          this.updateCurrentPan({ right: `${newCurrentPanRight}%` });
        }
      }
    }
  }
</script>
