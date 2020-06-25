<template>

  <div>

    <v-container grid-list-md fluid>
    <v-layout>
      <v-flex xs12 sm6 md3 lg2 v-for="block in blocks" :key="block._id">
        <v-card class="fill-height">
          <v-img :src="'/api/v1/blocks/' + block._id + '/image'"
                  aspect-ratio="2.75" position="left top"
          ></v-img>

          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{block.title}}</h3>
              <div>{{block.description}}</div>
            </div>
          </v-card-title>

          <v-card-actions>
            <v-btn text color="orange" :to="{name: 'companyId-blocks-blockId', params: { accountId, blockId: block._id }}">Edit</v-btn>
            <v-btn text color="orange">Explore</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    </v-container>

  </div>

</template>
<style lang="scss">

</style>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';

  const { Action, State } = namespace('blocks');

  export default @Component({
    // middleware: ['auth'],
    components: {
    }
  })
  class Index extends Vue {
    @Action loadBlocks;

    @State blocks;

    get accountId () {
      return this.$route.params.companyId;
    }

    mounted () {
      this.loadBlocks();
    }
  }
</script>
