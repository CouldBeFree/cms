<template>

  <v-container fluid>

    <v-card>
      <domains-list :domains="domains" :loading="loading" />

      <v-dialog v-model="isShowCreateDialog" persistent max-width="600px">
        <v-btn slot="activator" absolute dark fab top right color="pink">
          <v-icon>add</v-icon>
        </v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">Create new domain</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="Template name*" required v-model="newDomainName"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="isShowCreateDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :loading="loading" :disabled="!newDomainName" text @click="onCreateNewDomainClick">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="showError" :bottom="false" color="error">
        {{ error }}
        <v-btn color="white" text @click="showError = false">
          Close
        </v-btn>
      </v-snackbar>
    </v-card>
  </v-container>

</template>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import DomainsList from '~/components/domains/DomainsList';

  const { Action, State } = namespace('domains');

  export default @Component({
    // middleware: ['auth'],
    components: {
      DomainsList
    }
  })
  class Index extends Vue {
    @Action loadDomains;

    @Action createNewDomain;

    @State domains;

    isShowCreateDialog = false;

    newDomainName = '';

    loading = false;

    async mounted () {
      await this.loadDomains();
    }

    async onCreateNewDomainClick () {
      this.loading = true;

      const { _id } = await this.createNewDomain({ name: this.newDomainName });

      this.isShowCreateDialog = false;
      this.loadTemplates();
      this.$router.push({ name: 'domains-domainId', params: { templateId: _id } });

      this.loading = false;
    }
  }
</script>
