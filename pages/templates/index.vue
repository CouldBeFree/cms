<template>

  <v-container fluid>

    <h1>Templates</h1>

    <v-card class="pt-3">
      <v-list>
        <v-list-item v-for="template in templates" :key="template._id"
                     :to="{name: 'templates-templateId', params: { templateId: template._id }}">
          <!--v-list-item-avatar>
            <v-img :src="'/api/v1/blocks/' + block._id + '/image'"
                   aspect-ratio="2.75" position="left top"></v-img>
          </v-list-item-avatar-->

          <v-list-item-content>
            <v-list-item-title>{{ template.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ template.description }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon ripple><v-icon color="grey lighten-1">edit</v-icon></v-btn>
          </v-list-item-action>

          <v-list-item-action>
            <delete-menu :loading="deleting" @delete="onDeleteItem(template)">
              Are you sure to delete this template?
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
            <span class="headline">Create new template</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field label="Template name*" required v-model="newTemplateName"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="isShowCreateDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :loading="loading" :disabled="!newTemplateName" text @click="onCreateNewTemplateClick">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>

</template>
<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import DeleteMenu from '~/components/common/DeleteMenu';

  const { Action, State } = namespace('templates');

  export default @Component({
    // middleware: ['auth'],
    components: {
      DeleteMenu
    }
  })
  class Index extends Vue {
    @Action loadTemplates;

    @Action createNewTemplate;
    @Action deleteTemplate;

    @State templates;

    isShowCreateDialog = false;

    newTemplateName = '';

    loading = false;

    async mounted () {
      await this.loadTemplates();
    }

    async onCreateNewTemplateClick () {
      this.loading = true;

      const { _id } = await this.createNewTemplate({ title: this.newTemplateName });

      this.isShowCreateDialog = false;
      this.loadTemplates();
      this.$router.push({ name: 'templates-templateId', params: { templateId: _id } });

      this.loading = false;
    }

    async onDeleteItem (block) {
      this.deleting = true;

      await this.deleteTemplate([block._id]);
      await this.loadTemplates();

      this.deleting = false;
    }
  }
</script>
