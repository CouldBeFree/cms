<template>

  <v-container fluid>

    <h1>Blocks</h1>

    <v-card class="pt-3">
      <v-list>
        <v-list-item v-for="block in blocks" :key="block._id"
                     :to="{name: 'blocks-blockId', params: { blockId: block._id }}">
          <!--v-list-item-avatar>
            <v-img :src="'/api/v1/blocks/' + block._id + '/image'"
                   aspect-ratio="2.75" position="left top"></v-img>
          </v-list-item-avatar-->

          <v-list-item-content>
            <v-list-item-title>{{ block.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ block.description }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon ripple><v-icon color="grey lighten-1">edit</v-icon></v-btn>
          </v-list-item-action>

          <v-list-item-action>
            <delete-menu :loading="deleting" @delete="onDeleteItem(block)">
              Are you sure to delete this block?
            </delete-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-dialog v-model="isShowCreateDialog" persistent max-width="600px">
        <v-btn slot="activator" absolute dark fab top right color="pink">
          <v-icon>add</v-icon>
        </v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">Create new block</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="Block name*" required v-model="newBlockName"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="isShowCreateDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :loading="loading" :disabled="!newBlockName" text @click="onCreateNewBlockClick">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>

  </v-container>

</template>
<style lang="scss">

</style>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { Action, State } = namespace('blocks');

  export default @Component({
    // middleware: ['auth'],
    components: {
      DeleteMenu
    }
  })
  class Index extends Vue {
    @Action loadBlocks;
    @Action createNewBlock;
    @Action deleteBlock;

    @State blocks;

    isShowCreateDialog = false;

    loading = false;
    deleting = false;

    newBlockName = '';

    mounted () {
      this.loadBlocks();
    }

    async onCreateNewBlockClick () {
      this.loading = true;

      // const { _id } = await this.createNewBlock({ title: this.newBlockName });

      this.isShowCreateDialog = false;
      this.loadBlocks();
      // this.$router.push({ name: 'blocks-blockId', params: { blockId: _id } });

      this.loading = false;
    }

    async onDeleteItem (block) {
      this.deleting = true;

      await this.deleteBlock([block._id]);
      await this.loadBlocks();

      this.deleting = false;
    }
  }
</script>
