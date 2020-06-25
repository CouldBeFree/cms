<template>

  <div class="drag-handle" :class="{ enable }" ref="resizer" @mousedown="handleMouseDown"></div>

</template>
<style lang="scss" scoped>
  .drag-handle {
    width: 5px;
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    border-right: 1px solid #e2e2e2;
    z-index: 6;
    opacity: .5;
    cursor: no-drop;
    margin-left: -5px;

    &.horizontal {
      cursor: e-resize;
    }
    &.vertical {
      cursor: n-resize;
    }

    &.enable:hover {
      cursor: move;
      border-right: 1px dashed #39f;
    }
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default @Component({
    components: {}
  })
  class DragHandle extends Vue {
    @Prop() enable;

    @Prop() nextElem;

    @Prop() prevElem;

    resizing = false;

    originalNextPanLeft = null;

    originalNextPanRight = null;

    originalCurrentPanRight = null;

    originalCurrentPanLeft = null;

    currentPan = null;

    nextPan = null;

    handleMouseDown () {
      this.resizing = true;
      this.currentPan = this.prevElem.elm;
      this.nextPan = this.nextElem.elm;
      this.originalNextPanLeft = parseFloat(this.nextPan.style.left || 0);
      this.originalNextPanRight = parseFloat(this.nextPan.style.right || 0);
      this.originalCurrentPanRight = parseFloat(this.currentPan.style.right || 0);
      this.originalCurrentPanLeft = parseFloat(this.currentPan.style.left || 0);

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      this.currentPan.parentNode.classList.add('resizing');
      // document.getElementById('output-iframe').classList.add('disable-mouse-events');
    }

    handleMouseUp () {
      this.resizing = false;
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      this.currentPan.parentNode.classList.remove('resizing');
      // document.getElementById('output-iframe').classList.remove('disable-mouse-events');
    }

    handleMouseMove (e) {
      if (e.buttons === 0) {
        this.handleMouseUp();
        return;
      }
      if (!this.resizing) {
        return;
      }
      e.preventDefault();
      const newNextPanLeft = e.clientX / window.innerWidth * 100;
      if (
        (newNextPanLeft - this.originalCurrentPanLeft > 5) &&
        (100 - newNextPanLeft - this.originalNextPanRight > 5)
      ) {
        this.$emit('update:left', `${newNextPanLeft}%`);

        const newCurrentPanRight = this.originalCurrentPanRight - (newNextPanLeft - this.originalNextPanLeft);
        this.$emit('update:right', `${newCurrentPanRight}%`);
      }
    }
  }
</script>
