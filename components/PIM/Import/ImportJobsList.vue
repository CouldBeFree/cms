<template>

  <div>

    <v-card id="items-list" class="mt-1">
      <v-progress-linear v-if="loading" style="margin-top: -3px" class="mb-0" :height="3" indeterminate></v-progress-linear>

      <v-list v-if="list && list.length">
        <v-list-item v-for="item in list" :key="item._id" link>
          <!--<v-list-item-action>-->
            <!--<category-icon :type="category.categoryType" :status="category.Status" />-->
          <!--</v-list-item-action>-->
          <v-list-item-action>
            <v-icon color="green" v-if="item.currentStatus.state === 'done'">mdi-check</v-icon>
            <v-icon v-else-if="item.currentStatus.state === 'inprocess'">mdi-spin mdi-loading</v-icon>
            <v-icon color="error" v-else-if="item.currentStatus.state === 'error'">mdi-exclamation</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>
              {{item.createdAt | formatDate}}
              <strong>{{item.createdAt | formatTime}}</strong>
            </v-list-item-title>
            <v-list-item-subtitle v-if="item.currentStatus">
              {{item.currentStatus.text}}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action v-if="item.currentStatus.state === 'error' || item.currentStatus.state === 'done'">

            <delete-menu :loading="loading" @delete="$emit('delete', item)">
              Are you sure to delete this item?
            </delete-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <div v-else class="pa-5 align-center card-item">

        <v-icon left>mdi-receipt</v-icon>

        <span class="title">No jobs</span>

      </div>

      <v-pagination class="pa-2" v-if="countPages > 1"
                    :value="page"
                    @input="$emit('change-page', $event); $vuetify.goTo('#items-list', { easing: 'easeInOutCubic' })"
                    :length="countPages"></v-pagination>

    </v-card>
  </div>

</template>
<script>
  import moment from 'moment';
  import { Vue, Prop, Component } from 'vue-property-decorator';
  import DeleteMenu from '~/components/common/DeleteMenu';

  export default @Component({
    components: {
      DeleteMenu
    },
    filters: {
      formatDate (date) {
        return moment(date).format('DD.MM.YYYY');
      },
      formatTime (date) {
        return moment(date).format('HH:mm:ss');
      }
    }
  })
  class ImportJobsList extends Vue {
    @Prop() list;
    @Prop() loading;
    @Prop({ type: Number, default: 1 }) page;
    @Prop({ type: Number, default: 0 }) countPages;
  }
</script>
