import Route from '@ember/routing/route';

export default class VerifyRoute extends Route {
  async model(params) {
    const options = { method: 'GET', headers: { Authorization: `Bearer ${params.token}` } };

    let response = await fetch(`/users/verify_email`, options);
    if (response.status == 200) {
      let { data } = await response.json();
      return { data: data };
    } else {
      return { data: { error: true } };
    }
  }
}
