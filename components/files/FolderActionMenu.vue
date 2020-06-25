<template>

  <v-menu :close-on-content-click="false" style="width: 100%"
          :nudge-width="200" v-model="isOpen"
          offset-y
  >
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on"></slot>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon class="grey lighten-1 white--text">folder</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{title}}</v-list-item-title>
            <v-list-item-subtitle>
              <div v-if="folderPath && folderPath.length">
                Location:
                <v-breadcrumbs :items="folderPath">
                  <template slot="item" slot-scope="props">{{ props.item.title }}</template>
                </v-breadcrumbs>
              </div>
              <div v-else>
                Location: Root
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <div class="pa-3">
        <slot></slot>
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text @click="isOpen = false" :disabled="loading">Cancel</v-btn>
        <v-btn :color="actionColor" text @click="$emit('action')" :loading="loading" :disabled="disabled">{{actionTitle}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

</template>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';

  const { State } = namespace('folders');

  export default @Component({
  })
  class Index extends Vue {
    @State currentFolder;

    @Prop() title;

    @Prop() open;

    @Prop() disabled;

    @Prop() loading;

    @Prop() actionTitle;

    @Prop({ default: 'primary' }) actionColor;

    @Prop() includeCurrent;

    get folderPath () {
      if (!this.currentFolder || !this.currentFolder.path) {
        return [];
      }
      let folderPath = [...this.currentFolder.path];
      if (this.includeCurrent) {
        folderPath.push(this.currentFolder);
      }
      return folderPath;
    }

    get isOpen () {
      return this.open;
    }

    set isOpen (val) {
      this.$emit('update:open', val);
    }
  }
</script>
