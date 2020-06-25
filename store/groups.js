import Vue from 'vue';

export const state = () => ({
  error: null,
  loading: false,
  groups: [],
  details: {},
  detailsLoading: false
});

export const mutations = {
  setError (state, error) {
    state.error = error;
  },
  setLoading (state, loading) {
    state.loading = loading;
  },
  setDetailsLoading (state, loading) {
    state.detailsLoading = loading;
  },
  setGroups (state, groups) {
    state.groups = groups;
  },
  setDetails (state, details) {
    state.details = details;
  },
  setDetailsParam (state, [param, value]) {
    Vue.set(state.details, param, value);
  }
};

export const actions = {
  async loadGroups ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/attributes-groups', { params: {} });

    commit('setGroups', list);
    commit('setLoading', false);
    return list;
  },
  async loadDetails ({ state, commit }, _id) {
    commit('setLoading', true);
    const list = await this.$axios.$get(`/api/v1/attributes-groups/${_id}`, { params: {} });

    commit('setDetails', list);
    commit('setLoading', false);
    return list;
  },
  async saveGroup ({ state, commit }) {
    commit('setDetailsLoading', true);
    commit('setError', null);
    try {
      if (state.details._id) {
        await this.$axios.$put(`/api/v1/attributes-groups/${state.details._id}`, state.details);
      } else {
        await this.$axios.$post(`/api/v1/attributes-groups`, state.details);
      }
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setDetailsLoading', false);
  },
  async deleteGroup ({ state, commit }, ids) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$delete(`/api/v1/attributes-groups`, { data: { ids } });
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  }
};
