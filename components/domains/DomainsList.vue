<template>

    <div>

        <v-progress-linear v-if="loading" style="margin-top: -3px" class="mb-0" :height="3"
                       indeterminate></v-progress-linear>

        <v-list v-if="domains && domains.length">
            <template v-for="(list, clientName) in domainsGroups">
                <v-subheader>
                    {{clientName}}
                </v-subheader>
                <v-list-item v-for="domain in list" :key="domain._id" @click=""
                             :to="{name: 'domains-domainId', params: { domainId: domain._id }}">
                    <v-list-item-action>
                        <!--<project-icon :type="domain.ProjectType" :status="domain.Status"/>-->
                    </v-list-item-action>

                    <v-list-item-content>
                        <v-list-item-title
                                :class="domain.status === 'Inactive' ? 'grey--text text--lighten-1' : 'font-weight-bold'">
                            {{domain.name}}
                        </v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-btn icon @click.prevent="$emit('edit', domain)">
                            <v-icon color="grey lighten-1">edit</v-icon>
                        </v-btn>
                    </v-list-item-action>
                    <v-list-item-action>
                        <v-menu left :close-on-content-click="false" :nudge-width="250" offset-y
                                v-model="domain.showDeleteMenu">
                            <v-btn slot="activator" icon ripple @click.prevent>
                                <v-icon color="grey lighten-1">delete</v-icon>
                            </v-btn>

                            <v-card dark color="error">
                                <v-card-text>
                                    Are you sure to delete this domain?
                                </v-card-text>
                                <v-card-actions class="d-block text-xs-right">
                                    <v-btn text :loading="loadingDeleting" :disabled="loadingDeleting"
                                           @click="onDeletedomainClick(domain)">Delete
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-menu>
                    </v-list-item-action>
                </v-list-item>
            </template>
        </v-list>
        <div v-else-if="!loading" class="pa-5 align-center">

            <v-icon left>mdi-receipt</v-icon>
            <span class="title">No domains</span>

        </div>
        <div v-else class="pa-5 align-center">

            <v-icon left class="mdi-spin">mdi-loading</v-icon>
            <span class="title">Loading</span>

        </div>

        <v-pagination class="pa-2" v-if="countPages > 1"
                      :value="page"
                      @input="setPage($event); $emit('update-list'); $vuetify.goTo('#domains-list', { easing: 'easeInOutCubic' })"
                      :length="countPages"></v-pagination>

    </div>

</template>
<script>
import Vue from 'vue';
import groupBy from 'lodash/groupBy';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

export default
@Component({
  components: {
  },
  middleware: 'auth'
})
class DomainsList extends Vue {
  @Prop(Array) domains;

  @Prop(Boolean) loading;

  get domainsGroups () {
    return groupBy(this.domains, domain => domain.name[0]);
  }
}
</script>
