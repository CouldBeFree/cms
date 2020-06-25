import set from 'lodash/set';

export const state = () => ({
  pages: [],
  loadingPages: false,
  details: {},
  isDirty: false
});

export const mutations = {
  setPages (state, list) {
    state.pages = list;
  },
  setLoadingPages (state, loading) {
    state.loadingPages = loading;
  },
  setDetails (state, details) {
    state.details = details;
  },
  setDirty (state, isDirty) {
    state.isDirty = isDirty;
  },
  setDetailsField (state, [field, value]) {
    console.info(field, value);
    set(state.details, field, value);
  }
};

export const actions = {
  async loadPages ({ state, commit }) {
    commit('setLoadingPages', true);
    const list = await this.$axios.$get('/api/v1/pages', { params: {} });

    Object.freeze(list);
    commit('setPages', list);
    commit('setLoadingPages', false);
    return list;
  },
  async createNewPage ({ state, commit }, template) {
    return this.$axios.$post(`/api/v1/pages`, template);
  },
  async deletePage ({ state, commit }, _id) {
    return this.$axios.$delete(`/api/v1/pages/${_id}`);
  },
  async savePageDetails ({ state, commit }) {
    const details = await this.$axios.$put(`/api/v1/pages/${state.details._id}`, state.details);

    commit('setDirty', false);
    return details;
  },
  async loadPageDetails ({ state, commit }, _id) {
    const details = await this.$axios.$get(`/api/v1/pages/${_id}`, { params: { accountId: state.accountId } });

    commit('setDirty', false);
    commit('setDetails', details);
    return details;
  }
};
