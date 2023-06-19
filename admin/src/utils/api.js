import {axiosInstance, getRequestUrl} from './';

const api = {
  get: async (id, params) => {
    console.log(getRequestUrl(id, params));
    const {data} = await axiosInstance.get(getRequestUrl(id, params));

    return data;
  },

  postAction: body => {
    console.log(getRequestUrl());
    return axiosInstance.post(getRequestUrl(), body);
  },

  postLocaleAction: (id, body) => {
    console.log(getRequestUrl(`${id}/localizations`));
    return axiosInstance.post(getRequestUrl(`${id}/localizations`), body);
  },

  putAction: (id, body) => {
    return axiosInstance.put(getRequestUrl(`${id}?nested&populate=*`), body);
  },

  deleteAction: id => {
    return axiosInstance.delete(getRequestUrl(id));
  },
};

export default api;
