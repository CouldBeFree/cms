import { EventBus } from '~/helpers/event-bus';

export default function ({ $axios, redirect }) {
  $axios.interceptors.response.use(
    response => {
      if (response.headers['x-account-sudo']) {
        EventBus.$emit('sudo-account', response.headers['x-account-sudo']);
      }
      return response;
    },
    function (error) {
      // EventBus.$emit('error-notify', error);
      if (error.response.status === 401) {
        return redirect('/auth/signin');
      }
      return Promise.reject(error.response);
    }
  );
}
