<template>

  <div>

    <div v-if="value && value[0]">
      <v-avatar style="margin-right: 9px; overflow: hidden; cursor: pointer" v-for="item in value" @click="isFileDialogOpen = true" tile :size="120" color="grey lighten-4">

        <div>
          <v-img @click="isFileDialogOpen = true"
                 :src="`/api/v1/preview/${item._id}/120x120`"></v-img>
        </div>

      </v-avatar>
    </div>

    <div v-else>
      <v-avatar style="cursor: pointer" @click="isFileDialogOpen = true" :size="120" tile color="grey lighten-4"></v-avatar>
    </div>

    <file-dialog :multiple="multiple" :accept="['image/png', 'image/jpg', 'image/jpeg', 'image/gif']" :open.sync="isFileDialogOpen" :value="value" @input="$emit('input', $event)" />
  </div>

</template>
<script>
  import { Vue, Prop, Model, Component } from 'vue-property-decorator';
  import FileDialog from './FileDialog';

  export default @Component({
    components: {
      FileDialog
    }
  })
  class FileSelector extends Vue {
    @Model('input') value;

    @Prop({ default: '*' }) accept;

    @Prop(Boolean) multiple;

    @Prop(Boolean) disabled;

    isFileDialogOpen = false;
  }
</script>
