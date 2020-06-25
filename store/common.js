export const state = () => ({
  loading: false,
  accounts: []
});

export const mutations = {
  setAccounts (state, payload) {
    state.accounts = payload;
  },
  setLoading (state, loading) {
    state.loading = loading;
  }
};

export const actions = {
  async loadAccounts({ commit }) {
    commit('setLoading', true);
    try {
      const list = await this.$axios.$get(`/api/v1/accounts`);
      commit('setAccounts', list);
    } catch ({ response }) {
      console.error(response);
    }
    commit('setLoading', false);
  },

  async sudoUnderAccount ({ commit }, id) {
    commit('setLoading', true);
    try {
      const { token } = await this.$axios.$post(`/api/v1/auth/sudo`, id);

      this.$auth.setToken('local', `Beared ${token}`);
      location.reload();
    } catch ({ response }) {
      console.error(response);
    }
    commit('setLoading', false);
  },

  async forgetSudoAccount ({ commit }, id) {
    commit('setLoading', true);
    try {
      const { token } = await this.$axios.$delete(`/api/v1/auth/sudo`);

      this.$auth.setToken('local', `Beared ${token}`);
      location.reload();
    } catch ({ response }) {
      console.error(response);
    }
    commit('setLoading', false);
  }
};
