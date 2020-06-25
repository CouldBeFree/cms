import Vue from 'vue';
import without from 'lodash/without';

export const state = () => ({
  tabs: [],
  currentTab: 'index',
  categoryId: null,
  loading: false,
  data: [],
  error: false,
  categories: [],
  details: {},
  countPages: 0
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
  setCategories (state, categories) {
    state.categories = categories;
  },
  setError (state, error) {
    state.error = error;
  },
  closeTab (state, _id) {
    const resTab = state.tabs.find(item => item._id === _id);
    if (!resTab) {
      return;
    }
    state.tabs = without(state.tabs, resTab);
    if (state.currentTab === _id) {
      state.currentTab = state.tabs.length ? state.tabs[0]._id : 'index';
      console.info(state.currentTab);
    }
  },
  updateStatus(state, data) {
    const category = state.categories.find(item => item._id === data.categoryId);
    if (category) {
      category.importSettings = category.importSettings || {};
      category.importSettings.currentStatus = data;
    }
  }
};

export const actions = {
  async loadData ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/data', { params: { 'category._id': state.categoryId } });

    commit('setData', list);
    commit('setLoading', false);
    return list;
  },
  async loadCategories ({ state, commit }) {
    commit('setLoading', true);
    const list = await this.$axios.$get('/api/v1/categories', { params: {} });

    commit('setCategories', list);
    commit('setLoading', false);
    return list;
  },
  async saveCategory ({ commit, state }) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      if (state.details._id) {
        await this.$axios.$put(`/api/v1/categories/${state.details._id}`, state.details);
      } else {
        state.details.importSettings = { columns: true };
        await this.$axios.$post('/api/v1/categories', state.details);
      }
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  },
  async saveCategorySettings ({ commit, state }, { categoryId, settings }) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$put(`/api/v1/categories/${categoryId}/import`, settings);
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  },
  async runImport ({ commit, state }, { _id }) {
    commit('setLoading', true);
    commit('setError', null);
    try {
      await this.$axios.$post(`/api/v1/imports`, { category: { _id } });
    } catch ({ response }) {
      console.error(response);
      commit('setError', response.data.message);
    }
    commit('setLoading', false);
  },
  async deleteGroup ({ commit, state }, ids) {
    try {
      await this.$axios.delete(`/api/v1/categories/${ids}`);
    } catch ({ response }) {
      console.log(response);
    }
  }
};
