import Vue from 'vue';
import set from 'lodash/set';
import get from 'lodash/get';

export const state = () => ({
  error: null,
  loading: false,
  attributes: [],
  groupId: null,
  details: {},
  detailsLoading: false
});

export const mutations = {
  setGroupId (state, groupId) {
    state.groupId = groupId;
  },
  setError (state, error) {
    state.error = error;
  },
  setLoading (state, loading) {
    state.loading = loading;
  },
  setDetailsLoading (state, loading) {
    state.detailsLoading = loading;
  },
  setAttributes (state, attributes) {
    state.attributes = attributes;
  },
  setDetails (state, details) {
    state.details = details;
  },
  setDetailsParam (state, [param, value]) {
    Vue.set(state.details, param, value);
  },
  addListItem (state, [field, value]) {
    const list = get(state.details, field) || [];
    list.push(value);
    set(state.details, field, list);
  },
  editList (state, [field, value]) {
    set(state.details, field, value);
  },
  deleteListItem (state, [field, index]) {
    const list = get(state.details, field);
    list.splice(index, 1);
    set(state.details, field, list);
  }
};

export const actions = {
  async loadAttributes ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/attributes', { params: { attributeGroup: state.groupId } });

    commit('setAttributes', list);
    commit('setLoading', false);
    return list;
  },
  async saveAttribute ({ state, commit }) {
    commit('setDetailsLoading', true);
    commit('setError', null);
    try {
      if (state.details._id) {
        await this.$axios.$put(`/api/v1/attributes/${state.details._id}`, state.details);
      } else {
        state.details.attributeGroup = { _id: state.groupId };
        await this.$axios.$post(`/api/v1/attributes`, state.details);
      }
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setDetailsLoading', false);
  },
  async deleteAttribute ({ state, commit }, ids) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$delete(`/api/v1/attributes`, { data: { ids } });
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  }
};
