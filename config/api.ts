export const API_V1 = '/api/v1';

export enum Methods {
  update = 'update',
  auth = 'auth',
  get = 'get',
  search = 'search',
  sing = 'sing'
}

export const APIs = {
  updateAddress: `${API_V1}/${Methods.update}/address`,
  singOut: `${API_V1}/${Methods.sing}/out`,
  twitterAuth: `${API_V1}/${Methods.auth}/twitter`,
  twitterAuthReverse: `${API_V1}/${Methods.auth}/twitter/reverse`,
  getTweets: `${API_V1}/${Methods.get}/tweets`,
  tweetsUpdate: `${API_V1}/${Methods.update}/tweets`,
  searchTweet: `${API_V1}/${Methods.search}/tweets`,
  getblockchain: `${API_V1}/${Methods.get}/blockchain`
};