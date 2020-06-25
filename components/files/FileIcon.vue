<template>

  <v-img v-if="hasPreview" :src="`/api/v1/preview/${id}/${width}x${width}`"></v-img>
  <v-icon v-else :class="[toIconClass(contentType)]">{{ contentType|toIcon }}</v-icon>

</template>


<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  const accotiations = {
    'text/javascript': { icon: 'mdi-nodejs', color: 'amber white--text' },
    'image/jpg': { icon: 'mdi-file-image', color: 'blue white--text' },
    'image/jpeg': { icon: 'mdi-file-image', color: 'blue white--text' }
  };

  export default @Component({
    components: {
    },
    filters: {
      toIcon (contentType) {
        if (accotiations[contentType]) {
          return accotiations[contentType].icon;
        }
        return 'mdi-file-outline';
      }
    }
  })
  class FileIcon extends Vue {
    @Prop() id;
    @Prop() contentType;
    @Prop({ type: Number, default: 64 }) width;
    @Prop(Boolean) hasPreview;

    mounted () {
    }

    toIconClass (contentType) {
      if (accotiations[contentType]) {
        return accotiations[contentType].color;
      }
      return 'grey lighten-1 white--text';
    }
  }
</script>
