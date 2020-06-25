<template>
  <v-app>
    <v-navigation-drawer app :stateless="!$vuetify.breakpoint.smAndDown" :value="!$vuetify.breakpoint.smAndDown" :mini-variant="isMiniMenu" :temporary="$vuetify.breakpoint.smAndDown">


      <v-list>
        <!--v-list-item>
          <v-list-item-avatar>
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-list-item-avatar>
        </v-list-item-->

        <v-list-item>
          <v-list-item-content v-if="$auth.user">
            <v-list-item-title class="title">{{$auth.user.username}}</v-list-item-title>
            <v-list-item-subtitle v-if="$auth.user.email">{{$auth.user.email}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action v-if="$auth.user && $auth.user.canSudo">
            <v-btn icon ripple @click="swapUser = true">
              <v-icon>swap_horizontal_circle</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn icon ripple @click="logout">
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list
          shaped
      >
        <v-list-item-group v-for="(item, i) in menu" :key="i" color="primary">
          <v-list-item :to="item.to">
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>

            <v-list-item-action v-if="item.action">
              <v-btn icon ripple :to="item.action.to">
                <v-icon>{{item.action.icon}}</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <select-user-dialog v-model="swapUser" @select="onAccountSudoClick" :list="accounts"></select-user-dialog>

    <!--v-toolbar fixed app dark :clipped-right="true" color="teal darken-3">
      <v-autocomplete color="white"
                      v-model="selectedCompany"
                      :items="companies"
                      :loading="companiesLoading"
                      :search-input.sync="searchCompaniesQuery"
                      hide-no-data
                      hide-selected
                      item-text="title"
                      item-value="_id"
                      placeholder="Start typing to Search"
      ></v-autocomplete>
      <v-toolbar-title>
        <v-icon color="white">fastfood</v-icon>
        Panorama
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat @click="logout">Logout</v-btn>
      </v-toolbar-items>
    </v-toolbar-->
    <v-content fill-height>

      <div v-if="isSudoUser">
        <v-alert class="mb-0" :value="true" color="warning" icon="priority_high" outlined>
          You are currently working under {{isSudoUser}}
          <a href="" @click.prevent="logoutSudoAccount">Logout</a>
        </v-alert>
      </div>

      <global-app>
        <nuxt/>
      </global-app>

    </v-content>

    <upload-status-container/>
  </v-app>
</template>

<script>
  import Vue from 'vue';
  import Component, { namespace } from 'nuxt-class-component';
  import { Watch } from 'vue-property-decorator';
  import UploadStatusContainer from '~/components/files/UploadStatusContainer';
  import GlobalApp from '~/components/common/GlobalApp';
  import AuthMixin from '@biznestream/nuxt-base/mixins/auth';
  import SelectUserDialog from '~/components/common/SelectUserDialog';
  import { EventBus } from '~/helpers/event-bus';

  const { State, Action } = namespace('common');

  export default
  @Component({
    components: {
      GlobalApp,
      UploadStatusContainer,
      SelectUserDialog
    },
    middleware: ['auth', 'socket'],
    mixins: [AuthMixin]
  })
  class Index extends Vue {
    @State accounts;
    @State loading;
    @Action loadAccounts;
    @Action sudoUnderAccount;
    @Action forgetSudoAccount;

    isSudoUser = false;
    isMiniMenu = false;
    swapUser = false;

    items = [
      'web', 'shopping', 'videos', 'images', 'news'
    ];

    @Watch('loading')
    trackModal(newVal) {
      if (!newVal) {
        this.swapUser = false;
      }
    }

    onAccountSudoClick(account) {
      this.sudoUnderAccount({ _id: account._id });
    }
    logoutSudoAccount(data) {
      this.forgetSudoAccount();
    }

    menu = [
      { to: { name: 'pim' }, icon: 'mdi-package-variant', title: 'PIM', action: { to: { name: 'pim-settings' }, icon: 'settings' } },
      // { to: { name: 'blocks' }, icon: 'mdi-wall', title: 'Blocks' },
      { to: { name: 'files' }, icon: 'mdi-file-multiple', title: 'Files' }
      // { to: { name: 'templates' }, icon: 'mdi-brush', title: 'Templates' },
      // { to: { name: 'domains' }, icon: 'mdi-earth', title: 'Domains' }
    ];

    tab = '';

    get accountId () {
      return this.$route.params.companyId;
    }

    mounted () {
      this.selectedCompany = this.accountId;
      this.loadAccounts();

      EventBus.$on('sudo-account', (username) => {
        this.isSudoUser = username;
      });
    }
  }
</script>
