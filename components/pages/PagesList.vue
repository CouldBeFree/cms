<template>

  <div id="pages-list">
    <v-progress-linear v-if="loading" style="margin-top: -3px" class="mb-0" :height="3"
                       indeterminate></v-progress-linear>

    <v-list v-if="pages && pages.length">
      <v-list-item v-for="page in pages" :key="page._id" @click=""
                   :to="{name: 'domains-domainId-pageId', params: { domainId: page._id, pageId: page._id }}">
        <v-list-item-action>
          <!--<project-icon :type="page.ProjectType" :status="page.Status"/>-->
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title
              :class="page.status === 'Inactive' ? 'grey--text text--lighten-1' : 'font-weight-bold'">
            {{page.name}}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">edit</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-action>
          <v-menu left :close-on-content-click="false" :nudge-width="250" offset-y
                  v-model="page.showDeleteMenu">
            <v-btn slot="activator" icon ripple @click.prevent>
              <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>

            <v-card dark color="error">
              <v-card-text>
                Are you sure to delete this page?
              </v-card-text>
              <v-card-actions class="d-block text-xs-right">
                <v-btn text :loading="loadingDeleting" :disabled="loadingDeleting"
                       @click="$emit('delete', page)">Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else-if="!loading" class="pa-5 align-center">

      <v-icon left>mdi-receipt</v-icon>
      <span class="title">No pages</span>

    </div>
    <div v-else class="pa-5 align-center">

      <v-icon left class="mdi-spin">mdi-loading</v-icon>
      <span class="title">Loading</span>

    </div>

    <v-pagination class="pa-2" v-if="countPages > 1"
                  :value="page"
                  @input="setPage($event); $emit('update-list'); $vuetify.goTo('#pages-list', { easing: 'easeInOutCubic' })"
                  :length="countPages"></v-pagination>

  </div>

</template>
<script>
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import Component from 'nuxt-class-component';

  export default
  @Component({
    components: {
    },
    middleware: 'auth'
  })
  class PagessList extends Vue {
    @Prop(Array) pages;

    @Prop(Boolean) loading;
  }
</script>
