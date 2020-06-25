<template>

  <div style="position: relative;" class="pt-3">

    <pages-list :pages="pages" :loading="loadingPages" @delete="onPageDelete"></pages-list>

    <v-dialog v-model="isShowCreateDialog" persistent max-width="600px">
      <v-btn slot="activator" absolute dark fab top right color="pink">
        <v-icon>add</v-icon>
      </v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">Create new page</span>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="error"
              :value="true"
              type="error"
          >
            {{error}}
          </v-alert>
          <v-container>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field label="Page name*" required v-model="newPageName"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isShowCreateDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" :loading="loading" :disabled="!newPageName" text @click="onCreateNewPageClick">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

</template>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import PagesList from '~/components/pages/PagesList';

  const { Action, State } = namespace('pages');

  export default @Component({
    // middleware: ['auth'],
    components: {
      PagesList
    }
  })
  class Index extends Vue {
    @Action loadPages;

    @Action createNewPage;
    @Action deletePage;

    @State pages;
    @State loadingPages;

    isShowCreateDialog = false;

    newPageName = '';

    error = null;

    loading = false;

    async mounted () {
      await this.loadPages();
    }

    async onCreateNewPageClick () {
      this.error = null;
      this.loading = true;

      try {
        const { _id } = await this.createNewPage({ name: this.newPageName });
        console.info(_id);
        this.isShowCreateDialog = false;
        this.loadPages();
      } catch ({ response }) {
        this.error = response.data.message;
      }
      // this.$router.push({ name: 'domains-domainId', params: { templateId: _id } });

      this.loading = false;
    }

    async onPageDelete (page) {
      this.loading = true;
      await this.deletePage(page._id);
      await this.loadPages();
      this.loading = false;
    }
  }
</script>
