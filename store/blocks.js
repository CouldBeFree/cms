import set from 'lodash/set';

export const state = () => ({
  blocks: [],
  loadingBlocks: false,
  details: {},
  isDirty: false
});

export const mutations = {
  setBlocks (state, list) {
    state.blocks = list;
  },
  setDetails (state, details) {
    state.details = details;
  },
  setDetailsPans (state, pans) {
    state.isDirty = true;
    state.details.pans = pans;
  },
  setDetailsField (state, [field, value]) {
    console.info(field, value);
    state.isDirty = true;
    set(state.details, field, value);
  },
  setLoadingBlocks (state, loading) {
    state.loadingBlocks = loading;
  },
  setDirty (state, isDirty) {
    state.isDirty = isDirty;
  }
};

export const actions = {
  async loadBlocks ({ state, commit }) {
    commit('setLoadingBlocks', true);
    const list = await this.$axios.$get('/api/v1/blocks', { params: { accountId: state.accountId } });

    commit('setBlocks', list);
    commit('setLoadingBlocks', false);
    return list;
  },
  async createNewBlock ({ state, commit }, block) {
    return this.$axios.$post(`/api/v1/blocks`, block);
  },
  async saveBlockDetails ({ state, commit }) {
    const data = { ...state.details };
    delete data.__v;
    const details = await this.$axios.$put(`/api/v1/blocks/${state.details._id}`, data);

    commit('setDirty', false);
    return details;
  },
  async loadBlockDetails ({ state, commit }, _id) {
    const details = await this.$axios.$get(`/api/v1/blocks/${_id}`, { params: { accountId: state.accountId } });

    commit('setDirty', false);
    details.attributes = details.attributes || [];
    commit('setDetails', details);
    return details;
  },
  async deleteBlock ({ state, commit }, ids) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$delete(`/api/v1/blocks`, { data: { ids } });
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  }
};
