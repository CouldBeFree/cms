<template>

  <div v-if="details">
    <v-card-text>


      <v-text-field :value="details.name" @input="setDetailsField(['name', $event])" label="Name"></v-text-field>

      <v-text-field :value="details.title" @input="setDetailsField(['title', $event])"
                    label="Title (H1)"></v-text-field>

      <v-text-field :value="details.slug" @input="setDetailsField(['slug', $event])"
                    label="Permalink"></v-text-field>

      <v-text-field :value="details.meta_title" @input="setDetailsField(['meta_title', $event])"
                    label="meta_title"></v-text-field>

      <v-text-field :value="details.meta_description" @input="setDetailsField(['meta_description', $event])"
                    label="meta_description"></v-text-field>

      <v-subheader>Blocks</v-subheader>

      <blocks-list :blocks="details.blocks" :items="details.blocks" @input="setDetailsField(['blocks', $event])"></blocks-list>

    </v-card-text>

    <v-card-actions>
      <v-btn color="blue darken-1" dark :loading="loading" :disabled="loading" @click="savePage">Save</v-btn>

      <v-snackbar v-model="saved" color="success">
        Page saved!
        <v-btn dark text @click="saved = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-card-actions>
  </div>

</template>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import BlocksList from '~/components/pages/BlocksList';

  const { Action, State, Mutation } = namespace('pages');

  export default @Component({
    // middleware: ['auth'],
    components: {
      BlocksList
    }
  })

  class Index extends Vue {
    @Action loadPages;
    @Action loadPageDetails;
    @Action savePageDetails;

    @Mutation setDetailsField;

    @State details;

    loading = false;
    saved = false;

    get pageId () {
      return this.$route.params.pageId;
    }

    async mounted () {
      await this.loadPageDetails(this.pageId);
    }

    async savePage () {
      this.loading = true;
      await this.savePageDetails();

      this.saved = true;
      this.loading = false;
    }
  }
</script>
