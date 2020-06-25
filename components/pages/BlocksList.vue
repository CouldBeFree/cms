<template>

  <div id="pages-list">
    <v-progress-linear v-if="loading" style="margin-top: -3px" class="mb-0" :height="3"
                       indeterminate></v-progress-linear>

    <v-list v-if="items && items.length">
      <v-list-item v-for="block in items" :key="block._id" @click="">
        <v-list-item-action>
          <!--<project-icon :type="block.ProjectType" :status="block.Status"/>-->
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>
            {{block.title}}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">edit</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-action>
          <v-menu left :close-on-content-click="false" :nudge-width="250" offset-y :value="deleteBlockId === block._id">
            <v-btn slot="activator" icon ripple @click.prevent="deleteBlockId = block._id">
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>

            <v-card dark color="error">
              <v-card-text>
                Are you sure to delete this block?
              </v-card-text>
              <v-card-actions class="d-block text-xs-right">
                <v-btn text @click="removeBlock(block)">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else-if="!loading" class="pa-5 align-center">

      <v-icon left>mdi-receipt</v-icon>
      <span class="title">No blocks</span>

    </div>
    <div v-else class="pa-5 align-center">

      <v-icon left class="mdi-spin">mdi-loading</v-icon>
      <span class="title">Loading</span>

    </div>

    <div v-if="!loading">

      <v-select item-text="title" return-object
          :items="blocks" v-model="selectedBlock"
          label="Block"
      ></v-select>

      <v-btn @click="addBlock(selectedBlock)">Add block</v-btn>
    </div>
  </div>

</template>
<script>
  import Vue from 'vue';
  import without from 'lodash/without';
  import { Model, Prop } from 'vue-property-decorator';
  import Component, { namespace } from 'nuxt-class-component';

  const { State, Action } = namespace('blocks');

  export default
  @Component({
    components: {
    },
    middleware: 'auth'
  })
  class BlocksList extends Vue {
    @Model('input', { type: Array }) items;

    @Prop(Boolean) loading;

    @Action loadBlocks;

    @State blocks;

    selectedBlock = null;

    deleteBlockId = null;

    mounted () {
      this.loadBlocks();
    }

    addBlock (block) {
      const arr = [...this.items, block];
      this.$emit('input', arr);
    }

    removeBlock (block) {
      this.$emit('input', without(this.items, block));
    }
  }
</script>
