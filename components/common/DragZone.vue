<style lang="scss">
  .drag-zones {
    position: relative;
    width: 100%;

    .drag-zone {
      position: absolute;
      width: auto;
      top: 0;
      bottom: 0;
      overflow: auto;
    }
  }
</style>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';
  import DragHandle from '~/components/common/DragHandle';

  export default @Component({
    functional: true,
    components: {
      DragHandle
    }
  })
  class DragZone extends Vue {
    @Prop() options;

    render (createElement, context) {
      var children = null;
      var slots = context.slots();

      var slotChildren = (slots.default || []).filter(child => !child.text && child.context);

      if (slotChildren) {
        children = [];

        let prevElem = slotChildren[0];
        children.push(prevElem);
        for (let index = 1; index < slotChildren.length; index++) {
          var separator = slots.separator || createHandler(prevElem, slotChildren[index]);
          children.push(separator);
          children.push(slotChildren[index]);
          prevElem = slotChildren[index];
        }
      }
      for (let zoneIndex in slotChildren) {
        if (!slotChildren.hasOwnProperty(zoneIndex) || !slotChildren[zoneIndex].context) {
          continue;
        }
        if (slotChildren[zoneIndex].elm) {
          const elm = slotChildren[zoneIndex].elm;
          elm.classList.add('drag-zone');
          setStyle(elm, getZoneStyle(slotChildren, zoneIndex));
          continue;
        }
        slotChildren[zoneIndex].context.$once('hook:updated', () => onComponentUpdate(slotChildren[zoneIndex].elm, zoneIndex));
      }

      return createElement('div', { class: { 'drag-zones': true }, ...context.data }, children);

      function onComponentUpdate (elm, zoneIndex) {
        elm.classList.add('drag-zone');

        setStyle(elm, getZoneStyle(slotChildren, zoneIndex));
      }

      function createHandler (prevElem, nextElem) {
        return createElement('drag-handle', {
          props: { enable: true, prevElem, nextElem },
          on: {
            'update:left': (left) => setStyle(nextElem.elm, { left }),
            'update:right': (right) => setStyle(prevElem.elm, { right })
          }
        });
      }

      function getZoneStyle (zones, zoneIndex) {
        const panWidth = 100 / zones.length;
        const rightOffset = leftCount => zones.length - 1 - leftCount;
        const suffix = count => `${count * panWidth}%`;
        return {
          left: suffix(zoneIndex),
          right: suffix(rightOffset(zoneIndex))
        };
      }

      function setStyle (elm, { left, right }) {
        if (elm.style && left) {
          elm.style.left = left;
        }
        if (elm.style && right) {
          elm.style.right = right;
        }

        const nextElm = elm.previousElementSibling;
        if (nextElm && nextElm.style && left) {
          nextElm.style.left = left;
        }
        if (nextElm && nextElm.style && right) {
          nextElm.style.right = right;
        }
      }
    }
  }
</script>
