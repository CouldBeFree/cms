import Vue from 'vue';
import without from 'lodash/without';

export const state = () => ({
  loading: false,
  error: false,

  tabs: [],
  categories: [],
  currentTab: 'list',
  categoryId: null,
  data: [],
  details: {}
});

export const mutations = {
  openTab (state, tab) {
    if (!state.tabs.find(item => item._id === tab._id)) {
      state.tabs.push(tab);
    }
    state.currentTab = tab._id;
  },
  setDetailsParam (state, [param, value]) {
    Vue.set(state.details, param, value);
  },
  setCategories (state, categories) {
    state.categories = categories;
  },
  setData (state, data) {
    state.data = data;
  },
  setLoading (state, data) {
    state.loading = data;
  },
  setCategoryId (state, categoryId) {
    state.categoryId = categoryId;
  },
  setTab (state, tabId) {
    state.currentTab = tabId;
  },
  setDetails (state, payload) {
    state.details = payload;
  },
  setError (state, error) {
    state.error = error;
  },
  closeTab (state, { _id }) {
    const resTab = state.tabs.find(item => item._id === _id);
    if (!resTab) {
      return;
    }
    state.tabs = without(state.tabs, resTab);
    if (state.currentTab === _id) {
      state.currentTab = state.tabs.length ? state.tabs[state.tabs.length - 1]._id : 'index';
    }
  }
};

export const actions = {
  async loadCategories ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/categories', { params: {} });

    commit('setCategories', list);
    commit('setLoading', false);
    return list;
  },
  async loadData ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/data', { params: { 'category._id': state.categoryId } });

    commit('setData', list);
    commit('setLoading', false);
    return list;
  },
  saveProduct ({ state, commit }) {
    return this.$axios.$post('/api/v1/data', state.details);
  }
};
