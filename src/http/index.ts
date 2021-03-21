import { message } from 'antd';

import axios from 'axios';

import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

declare global {
  interface Window {
    routerBase?: string;
  }
}

class BizError extends Error {
  response?: AxiosResponse;
}

type Silence = true | false | 'success' | 'fail';

interface BizOptions extends AxiosRequestConfig {
  // 是否通知
  silence?: Silence;
  // 是否重新登录
  reAuth?: boolean;
}

// 状态码对映的消息
const codeMessage: { [key: number]: string } = {
  200: '操作成功。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方式不对',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 *
 * @param {url} url 请求的url
 * @param {options} Options request参数
 */

function request(url: string, options: BizOptions = {}) {
  const { silence = false, reAuth = false, headers, ...restOptions } = options;

  // 主要业务处理
  function bizHandler(response: AxiosResponse) {
    if (response?.data?.ok) {
      return response;
    }

    const bizError = new BizError('biz error');
    bizError.response = response;
    throw bizError;
  }

  //全局成功处理
  function successHandler(response: AxiosResponse) {
    const { data } = response;
    if (!(silence === true || silence === 'success')) {
      message.success({ content: data?.message || '操作成功' });
    }
    return data;
  }

  //全局错误处理
  function errorHandler(error: BizError): any {
    const { response, message: eMsg } = error;
    // reAuth标记是用来防止连续401的熔断处理

    if (response?.status === 401) {
      return reAuth
        ? reAuthorization()
        : message.warning({
            content: '请先登录',
            onClose: () => {
              localStorage.clear();
              location.replace(`/user-center/login/`);
            },
          });
    }
    // silence标记为true 则不显示消息
    if (!(silence === true || silence === 'fail')) {
      const timeoutMsg = eMsg.match('timeout') && '连接超时， 请检查网络。';
      const netErrMsg = eMsg.match('Network Error') && '网络错误，请检查网络。';

      message.error({
        content:
          // 超时
          timeoutMsg ||
          netErrMsg ||
          // 后端业务错误
          response?.data?.errMsg ||
          // 错误码错误
          codeMessage[response?.status as number] ||
          '未知错误',
      });
    }

    throw error;
  }

  // 重新授权处理
  function reAuthorization() {
    return RESTful.get('/uc/oauth2/refresh', {
      reAuth: false,
      silence: 'success',
      params: { token: localStorage.getStorage('refresh_token') },
    }).then((resp: AxiosResponse) => {
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('refresh_token', resp.data.refresh_token);
      return request(url, { ...options, reAuth: false });
    });
  }

  return (
    axios(url, {
      timeout: 10000,
      headers: {
        Authorization: `${localStorage.getItem('token')}`,
        ...headers,
      },
      ...restOptions, // axios request options
    })
      // 业务pipe
      .then(bizHandler)
      // 请求成功pipe
      .then(successHandler)
      // 请求失败pipe
      .catch(errorHandler)
  );
}

const restful = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options'];
// 注入别名
export const RESTful = restful.reduce(
  (acc: { [k: string]: Function }, method) => ({
    ...acc,
    [method]: (url: string, options?: BizOptions) =>
      request(url, {
        method: method as Method,
        ...options,
      }),
  }),
  {},
);

const graphql = ['query', 'mutation'];
export const GraphQL = graphql.reduce(
  (acc: { [k: string]: Function }, method) => ({
    ...acc,
    [method]: (url: string, options?: BizOptions) => (...query: any[]) =>
      RESTful.post(url, {
        data: {
          query: `${method} {${query[0].reduce(
            (acc: string, cur: string, idx: number) =>
              acc + cur + (query[idx + 1] || ''),
            '',
          )}}`,
        },
        ...options,
      }),
  }),
  {},
);
