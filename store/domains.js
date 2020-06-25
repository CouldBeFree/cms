import set from 'lodash/set';

export const state = () => ({
  domains: [],
  loadingDomains: false,
  details: {},
  isDirty: false
});

export const mutations = {
  setDomains (state, list) {
    state.domains = list;
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
  setLoadingDomains (state, loading) {
    state.loadingDomains = loading;
  }
};

export const actions = {
  async loadDomains ({ state, commit }) {
    commit('setLoadingDomains', true);
    const list = await this.$axios.$get('/api/v1/domains', { params: {} });

    commit('setDomains', list);
    commit('setLoadingDomains', false);
    return list;
  },
  async createNewDomain ({ state, commit }, template) {
    return this.$axios.$post(`/api/v1/domains`, template);
  },
  async saveDomainDetails ({ state, commit }) {
    const details = await this.$axios.$put(`/api/v1/domains/${state.details._id}`, state.details);

    commit('setDirty', false);
    return details;
  },
  async loadDomainDetails ({ state, commit }, _id) {
    const details = await this.$axios.$get(`/api/v1/domains/${_id}`, { params: { accountId: state.accountId } });

    commit('setDirty', false);
    commit('setDetails', details);
    return details;
  }
};
