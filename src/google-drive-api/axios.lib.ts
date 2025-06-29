import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const AXIOS_CONFIG: AxiosRequestConfig = {
  timeout: 60000,
};

class AxiosLib {
  protected axiosInstance: AxiosInstance;
  private readonly reqConfig: AxiosRequestConfig;

  constructor() {
    this.reqConfig = {
      ...AXIOS_CONFIG,
    };
    this.axiosInstance = axios.create(this.reqConfig);
  }

  get axios() {
    return this.axiosInstance;
  }

  async get(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.get(url, {
      ...this.reqConfig,
      ...config,
    });

    return response;
  }

  async post(url: string, body: object, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.post(url, body, {
      ...this.reqConfig,
      ...config,
    });
    return response;
  }

  async put(url: string, body: object, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.put(url, body, {
      ...this.reqConfig,
      ...config,
    });
    return response;
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.delete(url, {
      ...this.reqConfig,
      ...config,
    });
    return response;
  }

  async head(url: string, config?: AxiosRequestConfig) {
    const response = await this.axiosInstance.head(url, {
      ...this.reqConfig,
      ...config,
    });

    return response;
  }
}

export default new AxiosLib();
