import ApplicationAdapter from './application';

export default class TfuelstakeAdapter extends ApplicationAdapter {
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.errors) {
      return payload.errors;
    } else {
      return payload;
    }
  }
}
