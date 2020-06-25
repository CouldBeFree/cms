import set from 'lodash/set';

export const state = () => ({
  templates: [],
  loadingTemplates: false,
  details: {},
  isDirty: false
});

export const mutations = {
  setTemplates (state, list) {
    state.templates = list;
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
  },
  setLoadingTemplates (state, loading) {
    state.loadingTemplates = loading;
  }
};

export const actions = {
  async loadTemplates ({ state, commit }) {
    commit('setLoadingTemplates', true);
    const list = await this.$axios.$get('/api/v1/templates', { params: {} });

    commit('setTemplates', list);
    commit('setLoadingTemplates', false);
    return list;
  },
  async createNewTemplate ({ state, commit }, template) {
    return this.$axios.$post(`/api/v1/templates`, template);
  },
  async saveTemplateDetails ({ state, commit }) {
    const details = await this.$axios.$put(`/api/v1/templates/${state.details._id}`, state.details);

    commit('setDirty', false);
    return details;
  },
  async loadTemplateDetails ({ state, commit }, _id) {
    const details = await this.$axios.$get(`/api/v1/templates/${_id}`, { params: { accountId: state.accountId } });

    commit('setDirty', false);
    commit('setDetails', details);
    return details;
  },
  async deleteTemplate ({ state, commit }, ids) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$delete(`/api/v1/templates`, { data: { ids } });
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  }
};
