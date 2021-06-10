import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.errors) {
      return payload.errors;
    } else {
      return payload;
    }
  }
}
