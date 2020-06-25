export const getters = {
  countPages(state) {
    return Math.ceil(state.total / state.perPage);
  }
};

export const state = () => ({
  loading: false,
  error: false,

  list: [],
  details: {},
  page: 1,
  perPage: 25,
  total: 0
});

export const mutations = {
  setList (state, list) {
    state.list = list;
  },
  setPage (state, page) {
    state.page = page;
  },
  setTotal (state, count) {
    state.total = count;
  },
  setLoading (state, data) {
    state.loading = data;
  },
  setError (state, error) {
    state.error = error;
  },
  updateStatus(state, data) {
    const job = state.list.find(item => item._id === data.importJobId);
    if (job) {
      job.currentStatus = data;
    }
  }
};

export const actions = {
  async loadData ({ state, commit }) {
    commit('setLoading', true);
    const { headers, data } = await this.$axios.get('/api/v1/import-jobs', {
      params: { page: state.page, size: state.perPage }
    });

    commit('setList', data);
    commit('setTotal', +headers['x-total-count']);
    commit('setLoading', false);
    return data;
  },
  async deleteJob ({ state }, { _id }) {
    return this.$axios.$delete(`/api/v1/import-jobs/${_id}`);
  }
};
